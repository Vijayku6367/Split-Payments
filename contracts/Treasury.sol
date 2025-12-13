// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Treasury {
    address public owner;
    mapping(address => bool) public authorized;

    struct ScheduledPayment {
        address splitter;
        uint256 amount;
        uint256 scheduleTime;
        bool executed;
    }

    ScheduledPayment[] public scheduledPayments;

    event ScheduledPaymentCreated(uint256 indexed id, address splitter, uint256 amount, uint256 scheduleTime);
    event PaymentExecuted(uint256 indexed id, address splitter, uint256 amount);

    modifier onlyOwnerOrAuthorized() {
        require(msg.sender == owner || authorized[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorized[msg.sender] = true;
    }

    function schedulePayment(
        address splitter,
        uint256 amount,
        uint256 scheduleTime
    ) external onlyOwnerOrAuthorized returns (uint256) {
        require(scheduleTime > block.timestamp, "Schedule time must be future");

        uint256 id = scheduledPayments.length;
        scheduledPayments.push(
            ScheduledPayment({
                splitter: splitter,
                amount: amount,
                scheduleTime: scheduleTime,
                executed: false
            })
        );

        emit ScheduledPaymentCreated(id, splitter, amount, scheduleTime);
        return id;
    }

    function executeScheduledPayment(uint256 id) external onlyOwnerOrAuthorized {
        _executeScheduledPayment(id);
    }

    function _executeScheduledPayment(uint256 id) internal {
        require(id < scheduledPayments.length, "Invalid ID");
        ScheduledPayment storage payment = scheduledPayments[id];

        require(!payment.executed, "Already executed");
        require(block.timestamp >= payment.scheduleTime, "Too early");

        (bool success, ) = payment.splitter.call(
            abi.encodeWithSignature("receivePayment(uint256)", payment.amount)
        );
        require(success, "Execution failed");

        payment.executed = true;
        emit PaymentExecuted(id, payment.splitter, payment.amount);
    }

    function batchExecutePayments(uint256[] calldata ids)
        external
        onlyOwnerOrAuthorized
    {
        for (uint256 i = 0; i < ids.length; i++) {
            if (
                ids[i] < scheduledPayments.length &&
                !scheduledPayments[ids[i]].executed &&
                block.timestamp >= scheduledPayments[ids[i]].scheduleTime
            ) {
                _executeScheduledPayment(ids[i]);
            }
        }
    }

    function authorize(address account) external onlyOwnerOrAuthorized {
        authorized[account] = true;
    }

    function revokeAuthorization(address account) external onlyOwnerOrAuthorized {
        authorized[account] = false;
    }

    function getScheduledPayments()
        external
        view
        returns (ScheduledPayment[] memory)
    {
        return scheduledPayments;
    }
}
