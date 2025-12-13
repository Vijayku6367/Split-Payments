// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Splitter.sol";

contract SplitFactory {
    address[] public allSplitters;
    mapping(address => address[]) public userSplitters;

    event SplitterCreated(
        address indexed creator,
        address splitterAddress,
        string name,
        address token,
        address[] members,
        uint256[] shares
    );

    function createSplitter(
        string memory name,
        address token,
        address[] memory members,
        uint256[] memory shares,
        bool autoDistribute
    ) external returns (address) {
        require(token != address(0), "Invalid token");
        require(members.length == shares.length, "Length mismatch");
        require(members.length > 0, "No members");

        uint256 totalShares;
        for (uint256 i = 0; i < shares.length; i++) {
            require(members[i] != address(0), "Zero member");
            require(shares[i] > 0, "Zero share");
            totalShares += shares[i];

            // duplicate member check
            for (uint256 j = i + 1; j < members.length; j++) {
                require(members[i] != members[j], "Duplicate member");
            }
        }
        require(totalShares > 0, "Invalid shares");

        Splitter splitter = new Splitter(
            msg.sender,
            name,
            token,
            members,
            shares,
            autoDistribute
        );

        address splitterAddress = address(splitter);
        allSplitters.push(splitterAddress);
        userSplitters[msg.sender].push(splitterAddress);

        emit SplitterCreated(
            msg.sender,
            splitterAddress,
            name,
            token,
            members,
            shares
        );

        return splitterAddress;
    }

    function getUserSplitters(address user)
        external
        view
        returns (address[] memory)
    {
        return userSplitters[user];
    }

    function getAllSplitters() external view returns (address[] memory) {
        return allSplitters;
    }
}
