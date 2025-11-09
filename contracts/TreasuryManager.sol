// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TreasuryManager
 * @dev Multi-signature treasury contract for ChainRelief disaster relief funds
 * @notice Manages incoming donations and distributes funds to verified relief organizations
 */
contract TreasuryManager is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    // Structs
    struct Donation {
        address donor;
        address token;
        uint256 amount;
        uint256 campaignId;
        uint256 timestamp;
        string txHash;
    }

    struct Campaign {
        string name;
        uint256 targetAmount;
        uint256 raisedAmount;
        address beneficiary;
        bool active;
        uint256 createdAt;
    }

    struct WithdrawalRequest {
        uint256 campaignId;
        address token;
        uint256 amount;
        address recipient;
        uint256 approvals;
        bool executed;
        mapping(address => bool) hasApproved;
    }

    // State variables
    uint256 public donationCount;
    uint256 public campaignCount;
    uint256 public withdrawalRequestCount;
    uint256 public requiredApprovals = 2;
    bool public paused;

    mapping(uint256 => Donation) public donations;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(address => bool) public verifiedOrganizations;
    mapping(uint256 => uint256[]) public campaignDonations;

    // Events
    event DonationReceived(
        uint256 indexed donationId,
        address indexed donor,
        address indexed token,
        uint256 amount,
        uint256 campaignId
    );

    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        uint256 targetAmount,
        address beneficiary
    );

    event CampaignUpdated(
        uint256 indexed campaignId,
        uint256 newTarget,
        bool active
    );

    event WithdrawalRequested(
        uint256 indexed requestId,
        uint256 campaignId,
        address token,
        uint256 amount,
        address recipient
    );

    event WithdrawalApproved(
        uint256 indexed requestId,
        address indexed approver
    );

    event WithdrawalExecuted(
        uint256 indexed requestId,
        address indexed recipient,
        uint256 amount
    );

    event OrganizationVerified(address indexed organization);
    event OrganizationRevoked(address indexed organization);
    event EmergencyPause(bool paused);

    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier onlyVerifiedOrganization() {
        require(verifiedOrganizations[msg.sender], "Not a verified organization");
        _;
    }

    /**
     * @dev Constructor sets up roles and initial configuration
     */
    constructor(address[] memory _admins, address[] memory _approvers) {
        require(_admins.length > 0, "At least one admin required");
        require(_approvers.length >= 2, "At least two approvers required");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        for (uint256 i = 0; i < _admins.length; i++) {
            _grantRole(ADMIN_ROLE, _admins[i]);
            _grantRole(DISTRIBUTOR_ROLE, _admins[i]);
        }

        for (uint256 i = 0; i < _approvers.length; i++) {
            _grantRole(APPROVER_ROLE, _approvers[i]);
        }
    }

    /**
     * @dev Receive ETH donations
     */
    receive() external payable {
        _recordDonation(msg.sender, address(0), msg.value, 0, "");
    }

    /**
     * @dev Record a donation (called by SideShift integration)
     * @param _donor Address of the donor
     * @param _token Token address (address(0) for ETH)
     * @param _amount Amount donated
     * @param _campaignId Campaign ID
     * @param _txHash Transaction hash from SideShift
     */
    function recordDonation(
        address _donor,
        address _token,
        uint256 _amount,
        uint256 _campaignId,
        string memory _txHash
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused {
        _recordDonation(_donor, _token, _amount, _campaignId, _txHash);
    }

    /**
     * @dev Internal function to record donations
     */
    function _recordDonation(
        address _donor,
        address _token,
        uint256 _amount,
        uint256 _campaignId,
        string memory _txHash
    ) internal {
        require(_amount > 0, "Amount must be greater than 0");

        donationCount++;
        donations[donationCount] = Donation({
            donor: _donor,
            token: _token,
            amount: _amount,
            campaignId: _campaignId,
            timestamp: block.timestamp,
            txHash: _txHash
        });

        if (_campaignId > 0 && _campaignId <= campaignCount) {
            campaigns[_campaignId].raisedAmount += _amount;
            campaignDonations[_campaignId].push(donationCount);
        }

        emit DonationReceived(donationCount, _donor, _token, _amount, _campaignId);
    }

    /**
     * @dev Create a new disaster relief campaign
     */
    function createCampaign(
        string memory _name,
        uint256 _targetAmount,
        address _beneficiary
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(_targetAmount > 0, "Target must be greater than 0");
        require(_beneficiary != address(0), "Invalid beneficiary");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            name: _name,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            beneficiary: _beneficiary,
            active: true,
            createdAt: block.timestamp
        });

        emit CampaignCreated(campaignCount, _name, _targetAmount, _beneficiary);
        return campaignCount;
    }

    /**
     * @dev Update campaign details
     */
    function updateCampaign(
        uint256 _campaignId,
        uint256 _newTarget,
        bool _active
    ) external onlyRole(ADMIN_ROLE) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid campaign");
        
        Campaign storage campaign = campaigns[_campaignId];
        campaign.targetAmount = _newTarget;
        campaign.active = _active;

        emit CampaignUpdated(_campaignId, _newTarget, _active);
    }

    /**
     * @dev Request withdrawal of funds
     */
    function requestWithdrawal(
        uint256 _campaignId,
        address _token,
        uint256 _amount,
        address _recipient
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused returns (uint256) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid campaign");
        require(_amount > 0, "Amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient");

        withdrawalRequestCount++;
        WithdrawalRequest storage request = withdrawalRequests[withdrawalRequestCount];
        request.campaignId = _campaignId;
        request.token = _token;
        request.amount = _amount;
        request.recipient = _recipient;
        request.approvals = 0;
        request.executed = false;

        emit WithdrawalRequested(
            withdrawalRequestCount,
            _campaignId,
            _token,
            _amount,
            _recipient
        );

        return withdrawalRequestCount;
    }

    /**
     * @dev Approve a withdrawal request
     */
    function approveWithdrawal(uint256 _requestId) 
        external 
        onlyRole(APPROVER_ROLE) 
        whenNotPaused 
    {
        require(_requestId > 0 && _requestId <= withdrawalRequestCount, "Invalid request");
        
        WithdrawalRequest storage request = withdrawalRequests[_requestId];
        require(!request.executed, "Already executed");
        require(!request.hasApproved[msg.sender], "Already approved");

        request.hasApproved[msg.sender] = true;
        request.approvals++;

        emit WithdrawalApproved(_requestId, msg.sender);

        // Auto-execute if enough approvals
        if (request.approvals >= requiredApprovals) {
            _executeWithdrawal(_requestId);
        }
    }

    /**
     * @dev Execute approved withdrawal
     */
    function _executeWithdrawal(uint256 _requestId) internal nonReentrant {
        WithdrawalRequest storage request = withdrawalRequests[_requestId];
        require(!request.executed, "Already executed");
        require(request.approvals >= requiredApprovals, "Not enough approvals");

        request.executed = true;

        if (request.token == address(0)) {
            // ETH transfer
            (bool success, ) = request.recipient.call{value: request.amount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 transfer
            IERC20(request.token).safeTransfer(request.recipient, request.amount);
        }

        emit WithdrawalExecuted(_requestId, request.recipient, request.amount);
    }

    /**
     * @dev Verify a relief organization
     */
    function verifyOrganization(address _organization) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_organization != address(0), "Invalid address");
        verifiedOrganizations[_organization] = true;
        emit OrganizationVerified(_organization);
    }

    /**
     * @dev Revoke organization verification
     */
    function revokeOrganization(address _organization) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        verifiedOrganizations[_organization] = false;
        emit OrganizationRevoked(_organization);
    }

    /**
     * @dev Emergency pause
     */
    function togglePause() external onlyRole(ADMIN_ROLE) {
        paused = !paused;
        emit EmergencyPause(paused);
    }

    /**
     * @dev Update required approvals
     */
    function setRequiredApprovals(uint256 _required) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_required > 0, "Must require at least 1 approval");
        requiredApprovals = _required;
    }

    /**
     * @dev Get campaign donations
     */
    function getCampaignDonations(uint256 _campaignId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return campaignDonations[_campaignId];
    }

    /**
     * @dev Get contract balance
     */
    function getBalance(address _token) external view returns (uint256) {
        if (_token == address(0)) {
            return address(this).balance;
        }
        return IERC20(_token).balanceOf(address(this));
    }
}


