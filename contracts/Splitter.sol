// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Splitter {
    address public owner;
    string public name;
    address public token;
    address[] public members;
    uint256[] public shares;
    uint256 public totalShares;
    bool public autoDistribute;

    struct Payment {
        uint256 amount;
        address payer;
        uint256 timestamp;
        bool distributed;
    }

    Payment[] public paymentHistory;

    event PaymentReceived(address indexed payer, uint256 amount, uint256 timestamp);
    event DistributionCompleted(address indexed member, uint256 amount, uint256 timestamp);
    event SharesUpdated(address[] newMembers, uint256[] newShares, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(
        address _owner,
        string memory _name,
        address _token,
        address[] memory _members,
        uint256[] memory _shares,
        bool _autoDistribute
    ) {
        require(_members.length == _shares.length, "Length mismatch");
        require(_members.length > 0, "No members");

        owner = _owner;
        name = _name;
        token = _token;
        members = _members;
        shares = _shares;
        autoDistribute = _autoDistribute;

        for (uint256 i = 0; i < _shares.length; i++) {
            totalShares += _shares[i];
        }
        require(totalShares > 0, "Invalid shares");
    }

    function receivePayment(uint256 amount) external {
        require(amount > 0, "Invalid amount");

        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        paymentHistory.push(
            Payment({
                amount: amount,
                payer: msg.sender,
                timestamp: block.timestamp,
                distributed: false
            })
        );

        emit PaymentReceived(msg.sender, amount, block.timestamp);

        if (autoDistribute) {
            _distribute();
        }
    }

    function distribute() external onlyOwner {
        _distribute();
    }

    function _distribute() internal {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance");

        for (uint256 i = 0; i < members.length; i++) {
            uint256 payout = (balance * shares[i]) / totalShares;
            if (payout > 0) {
                require(IERC20(token).transfer(members[i], payout), "Transfer failed");
                emit DistributionCompleted(members[i], payout, block.timestamp);
            }
        }

        paymentHistory[paymentHistory.length - 1].distributed = true;
    }

    function updateShares(address[] memory newMembers, uint256[] memory newShares)
        external
        onlyOwner
    {
        require(newMembers.length == newShares.length, "Length mismatch");
        require(newMembers.length > 0, "No members");

        delete members;
        delete shares;

        uint256 newTotal;
        for (uint256 i = 0; i < newShares.length; i++) {
            newTotal += newShares[i];
        }
        require(newTotal > 0, "Invalid shares");

        members = newMembers;
        shares = newShares;
        totalShares = newTotal;

        emit SharesUpdated(newMembers, newShares, block.timestamp);
    }

    function getMembers() external view returns (address[] memory, uint256[] memory) {
        return (members, shares);
    }

    function getPaymentHistory() external view returns (Payment[] memory) {
        return paymentHistory;
    }

    function getContractBalance() external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
