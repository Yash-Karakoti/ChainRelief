// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FundDistributor
 * @dev Automated fund distribution to verified relief organizations
 * @notice Distributes funds based on predefined rules and milestones
 */
contract FundDistributor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    // Structs
    struct Organization {
        string name;
        address wallet;
        bool verified;
        uint256 totalReceived;
        uint256 registeredAt;
    }

    struct DistributionRule {
        uint256 campaignId;
        address[] organizations;
        uint256[] percentages; // In basis points (100 = 1%)
        bool active;
    }

    struct Distribution {
        uint256 ruleId;
        address token;
        uint256 totalAmount;
        uint256 timestamp;
        bool executed;
    }

    // State variables
    uint256 public organizationCount;
    uint256 public ruleCount;
    uint256 public distributionCount;
    bool public paused;

    mapping(uint256 => Organization) public organizations;
    mapping(address => uint256) public organizationIds;
    mapping(uint256 => DistributionRule) public distributionRules;
    mapping(uint256 => Distribution) public distributions;
    mapping(uint256 => mapping(address => uint256)) public organizationShares;

    // Events
    event OrganizationRegistered(
        uint256 indexed orgId,
        string name,
        address indexed wallet
    );

    event OrganizationVerified(uint256 indexed orgId, bool verified);

    event DistributionRuleCreated(
        uint256 indexed ruleId,
        uint256 campaignId,
        address[] organizations,
        uint256[] percentages
    );

    event DistributionExecuted(
        uint256 indexed distributionId,
        uint256 indexed ruleId,
        address indexed token,
        uint256 totalAmount
    );

    event FundsDistributed(
        uint256 indexed distributionId,
        address indexed organization,
        address indexed token,
        uint256 amount
    );

    event EmergencyPause(bool paused);

    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor(address[] memory _admins) {
        require(_admins.length > 0, "At least one admin required");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        for (uint256 i = 0; i < _admins.length; i++) {
            _grantRole(ADMIN_ROLE, _admins[i]);
            _grantRole(DISTRIBUTOR_ROLE, _admins[i]);
        }
    }

    /**
     * @dev Register a new relief organization
     */
    function registerOrganization(
        string memory _name,
        address _wallet
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(_wallet != address(0), "Invalid wallet address");
        require(organizationIds[_wallet] == 0, "Organization already registered");

        organizationCount++;
        organizations[organizationCount] = Organization({
            name: _name,
            wallet: _wallet,
            verified: false,
            totalReceived: 0,
            registeredAt: block.timestamp
        });

        organizationIds[_wallet] = organizationCount;

        emit OrganizationRegistered(organizationCount, _name, _wallet);
        return organizationCount;
    }

    /**
     * @dev Verify an organization
     */
    function verifyOrganization(uint256 _orgId, bool _verified) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_orgId > 0 && _orgId <= organizationCount, "Invalid organization");
        organizations[_orgId].verified = _verified;
        emit OrganizationVerified(_orgId, _verified);
    }

    /**
     * @dev Create a distribution rule for a campaign
     */
    function createDistributionRule(
        uint256 _campaignId,
        address[] memory _organizations,
        uint256[] memory _percentages
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(_organizations.length > 0, "No organizations provided");
        require(
            _organizations.length == _percentages.length,
            "Arrays length mismatch"
        );

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _percentages.length; i++) {
            totalPercentage += _percentages[i];
        }
        require(totalPercentage == 10000, "Total must be 100% (10000 basis points)");

        ruleCount++;
        DistributionRule storage rule = distributionRules[ruleCount];
        rule.campaignId = _campaignId;
        rule.organizations = _organizations;
        rule.percentages = _percentages;
        rule.active = true;

        emit DistributionRuleCreated(
            ruleCount,
            _campaignId,
            _organizations,
            _percentages
        );

        return ruleCount;
    }

    /**
     * @dev Execute distribution based on a rule
     */
    function executeDistribution(
        uint256 _ruleId,
        address _token,
        uint256 _amount
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(_ruleId > 0 && _ruleId <= ruleCount, "Invalid rule");
        require(_amount > 0, "Amount must be greater than 0");

        DistributionRule storage rule = distributionRules[_ruleId];
        require(rule.active, "Rule is not active");

        distributionCount++;
        distributions[distributionCount] = Distribution({
            ruleId: _ruleId,
            token: _token,
            totalAmount: _amount,
            timestamp: block.timestamp,
            executed: false
        });

        // Transfer tokens to this contract first
        if (_token != address(0)) {
            IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        }

        // Distribute to organizations
        for (uint256 i = 0; i < rule.organizations.length; i++) {
            address orgWallet = rule.organizations[i];
            uint256 orgId = organizationIds[orgWallet];
            
            require(organizations[orgId].verified, "Organization not verified");

            uint256 share = (_amount * rule.percentages[i]) / 10000;
            
            if (_token == address(0)) {
                // ETH transfer
                (bool success, ) = orgWallet.call{value: share}("");
                require(success, "ETH transfer failed");
            } else {
                // ERC20 transfer
                IERC20(_token).safeTransfer(orgWallet, share);
            }

            organizations[orgId].totalReceived += share;
            organizationShares[distributionCount][orgWallet] = share;

            emit FundsDistributed(distributionCount, orgWallet, _token, share);
        }

        distributions[distributionCount].executed = true;

        emit DistributionExecuted(distributionCount, _ruleId, _token, _amount);

        return distributionCount;
    }

    /**
     * @dev Update distribution rule status
     */
    function setRuleActive(uint256 _ruleId, bool _active) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_ruleId > 0 && _ruleId <= ruleCount, "Invalid rule");
        distributionRules[_ruleId].active = _active;
    }

    /**
     * @dev Emergency pause
     */
    function togglePause() external onlyRole(ADMIN_ROLE) {
        paused = !paused;
        emit EmergencyPause(paused);
    }

    /**
     * @dev Get organization details by wallet
     */
    function getOrganizationByWallet(address _wallet) 
        external 
        view 
        returns (
            uint256 id,
            string memory name,
            bool verified,
            uint256 totalReceived
        ) 
    {
        uint256 orgId = organizationIds[_wallet];
        require(orgId > 0, "Organization not found");
        
        Organization memory org = organizations[orgId];
        return (orgId, org.name, org.verified, org.totalReceived);
    }

    /**
     * @dev Get distribution rule details
     */
    function getDistributionRule(uint256 _ruleId) 
        external 
        view 
        returns (
            uint256 campaignId,
            address[] memory orgs,
            uint256[] memory percentages,
            bool active
        ) 
    {
        require(_ruleId > 0 && _ruleId <= ruleCount, "Invalid rule");
        DistributionRule storage rule = distributionRules[_ruleId];
        return (rule.campaignId, rule.organizations, rule.percentages, rule.active);
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}


