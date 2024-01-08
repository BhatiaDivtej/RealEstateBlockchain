// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.9;

// ============================================================================
// Contracts
// ============================================================================

/**
 *  @title Land Registry Contract
 *  @notice This contract simulates a basic land registry system. It provides
 *  functionalities for registering, transferring, and selling parcels of land.
 *  It also provides query functionalities for verifying a land's details and
 *  listing all lands owned by a certain address.
 *  This contract should be used for simulation and educational purposes.
 *  @dev This contract is in its alpha version. The land registry system is
 *  abstracted to a basic level. It does not take into account many real-world
 *  factors that a complete land registry system might need, such as zoning
 *  laws, land rights, restrictions on the property, etc.
 *  This contract is not audited and therefore should not be used
 *  in production.
 *  @custom:experimental This is an experimental contract. It is intended as a
 *  demonstration for basic contract functionalities like storing data in the
 *  contract, using modifiers, and emitting events.
 *  Changes may be made without maintaining backward compatibility.
 *  @custom:gas-usage Certain functions like `registerLand`, `transferLand`
 *  and `sellLand` may consume more gas due to the operations involved such as
 *  updating the contract's storage and emitting events.
 *  @custom:potential-updates Future updates may include handling more complex
 *  land rights, integration with real-world data, improving gas efficiency,
 *  adding access control for admin operations, and more comprehensive testing.
 */
contract LandRegistry {
    // Structs
    // ========================================================================

    /**
     *  @title Land Struct
     *  @dev This struct encapsulates all the data related to a parcel of land.
     *  @notice The data includes information about the owner, the location,
     *  the parcelID, and the price.
     *  @param owner An Ethereum address representing the owner of the land
     *  parcel. This address must be payable to handle transfers of Ether
     *  during transactions.
     *  @param location A string representing the geographical location of the
     *  land parcel. It can be in any format, such as coordinates or a simple
     *  description, but consistency is advised for easier tracking.
     *  @param parcelID A unique string that serves as the identifier for the
     *  land parcel. It is used as the key in the mapping of lands in the
     *  LandRegistry contract.
     *  @param price A uint256 value representing the price of the land parcel
     *  in wei. This field is used in transactions where land parcels are bought
     *  and sold.
     */
    struct Land {
        address payable owner;
        string location;
        string parcelID;
        uint256 price;
        // Uncomment this if you want to include a flag indicating whether a
        // parcel of land is registered or not.
        // bool isRegistered;
    }

    // Mappings
    // ========================================================================

    /**
     *  @notice This mapping keeps track of all the land parcels.
     *  @dev It maps a unique parcel ID to a Land struct containing all details
     *  of the land parcel.
     */
    mapping(string => Land) public lands;

    /**
     *  @notice This mapping is used to keep track of all the lands owned by a
     *  particular address.
     *  @dev It maps an owner's address to an array of parcel IDs, allowing us
     *  to see all the lands owned by a particular address.
     */
    mapping(address => string[]) public ownerToLands;

    /**
     *  @dev Maps a parcel ID to a pending purchase's buyer address.
     *  This mapping is used to keep track of buyers who have initiated a purchase
     *  for a land parcel by sending the required Ether to the contract.
     *  The mapping only holds an entry if there is an active pending purchase.
     *  The entry is cleared once the sale is confirmed by the landowner.
     *  @notice This mapping allows the contract to escrow Ether sent by buyers and
     *  link it to the corresponding land parcel until the sale is confirmed.
     *  @return The Ethereum address of the buyer who has initiated the purchase,
     *  or the zero address if there is no pending purchase for the land parcel.
     */
    mapping(string => address payable) public pendingPurchases;

    // Events
    // ========================================================================

    /**
     *  LandRegistered Event
     *  @notice This event is emitted when a new land parcel is registered.
     *  @dev The event logs the owner's address and the parcel ID of the newly
     *  registered land.
     *  @param owner The owner's address.
     *  @param parcelID The unique parcel ID of the registered land parcel.
     */
    event LandRegistered(address indexed owner, string parcelID);

    /**
     *  LandTransferred Event
     *  @notice This event is emitted when a land parcel is transferred from
     *  one owner to another.
     *  @dev The event logs the old owner's address, the new owner's address,
     *  and the parcel ID of the transferred land parcel.
     *  @param oldOwner The address of the previous owner.
     *  @param newOwner The address of the new owner.
     *  @param parcelID The unique parcel ID of the transferred land parcel.
     */
    event LandTransferred(
        address indexed oldOwner,
        address indexed newOwner,
        string parcelID
    );

    /**
     *  @dev Emitted when a buyer initiates a purchase for a land parcel.
     *  Indicates that the buyer has sent the required Ether to the contract
     *  and wishes to proceed with the purchase.
     *  @param buyer The Ethereum address of the buyer who initiated the purchase.
     *  @param parcelID The unique identifier of the land parcel being purchased.
     *  @param price The amount of Ether sent by the buyer, intended as the purchase price.
     */
    event PurchasePending(
        address indexed buyer,
        string parcelID,
        uint256 price
    );

    /**
     *  @dev Emitted when a land sale is confirmed by the seller.
     *  Indicates that the ownership of the land parcel has been transferred
     *  to the buyer and the seller has received the payment.
     *  @param seller The Ethereum address of the seller confirming the sale.
     *  @param buyer The Ethereum address of the buyer who purchased the land.
     *  @param parcelID The unique identifier of the land parcel that was sold.
     *  @param price The sale price of the land, which has been paid to the seller.
     */
    event LandSold(
        address indexed seller,
        address indexed buyer,
        string parcelID,
        uint256 price
    );

    // Modifiers
    // ========================================================================

    /**
     *  onlyLandOwner
     *  @notice This modifier is used to restrict access to only the current
     *  owner of a specific land parcel.
     *  It's often used in functions that update or change the state of a land
     *  parcel. If the function is invoked by an address that is not the
     *  current owner, it will throw an exception and stop execution.
     *  @dev It checks if the message sender is the owner of the land parcel
     *  specified by _parcelID. If it is not, the execution of the function will
     *  stop, and an error message will be thrown.
     *  @param _parcelID The unique identifier of a land parcel. It is used to
     *  look up the current owner of the land in the 'lands' mapping.
     */
    modifier onlyLandOwner(string memory _parcelID) {
        require(
            lands[_parcelID].owner == msg.sender,
            "Only the current owner can perform this operation."
        );
        _;
    }

    // Methods
    // ========================================================================

    /**
     *  registerLand
     *  @notice This function allows an Ethereum address to register a new
     *  parcel of land in the contract. The parcel's location, unique
     *  parcel ID, and price are all required to perform this operation.
     *  Once the land is successfully registered, a LandRegistered event will
     *  be emitted, notifying all contract participants of the newly
     *  registered land.
     *  @dev This function has a protection mechanism built in to prevent
     *  duplicate registration of the same parcel of land. If an attempt is
     *  made to register a parcel that has already been registered, the
     *  function will throw an exception and halt execution.
     *  @param _location A string containing the geographical location of the
     *  land parcel. This could be a description of the land's physical
     *  location, coordinates, or any other identifying characteristic.
     *  @param _parcelID A unique identifier for the parcel of land. This ID
     *  is used to track the ownership and other properties of the land within
     *  the contract.
     *  @param _price A uint256 that represents the price of the land in the
     *  smallest unit of the currency used (such as wei for Ether). This price
     *  is set by the current owner of the land and could be used in future
     *  land sale transactions.
     */
    function registerLand(
        string memory _location,
        string memory _parcelID,
        uint256 _price
    ) public {
        // Check if the land parcel is already registered
        require(
            lands[_parcelID].owner == address(0),
            "This land parcel is already registered."
        );

        // Create a new Land struct and store it in the lands mapping
        lands[_parcelID] = Land(
            payable(msg.sender),
            _location,
            _parcelID,
            _price
        );

        // Add the parcelID to the list of lands owned by the sender
        ownerToLands[msg.sender].push(_parcelID);

        // Emit the event
        emit LandRegistered(msg.sender, _parcelID);
    }

    /**
     *  transferLand
     *  @notice This function allows the current owner of a land parcel to
     *  transfer ownership to another address. Once the transfer is complete,
     *  the ownership change is recorded in the contract, and a LandTransferred
     *  event is emitted. The function updates both the lands mapping and the
     *  ownerToLands mapping to reflect the new ownership.
     *  @dev The function uses the onlyLandOwner modifier to restrict its use to
     *  the current owner of the land parcel. It also calls an internal utility
     *  function to update the ownerToLands mapping.
     *  @param _newOwner The Ethereum address of the new owner to whom the land
     *  will be transferred. This address must be payable to receive land parcels.
     *  @param _parcelID The unique identifier of the land parcel being
     *  transferred. It is used to update the relevant mappings in the contract.
     */
    function transferLand(
        address payable _newOwner,
        string memory _parcelID
    ) public onlyLandOwner(_parcelID) {
        // Transfer the land to the new owner
        address oldOwner = lands[_parcelID].owner;
        lands[_parcelID].owner = _newOwner;

        // Update the ownerToLands mapping for the old owner
        removeLandFromOwner(oldOwner, _parcelID);

        // Update the ownerToLands mapping for the new owner
        ownerToLands[_newOwner].push(_parcelID);

        // Emit the event
        emit LandTransferred(oldOwner, _newOwner, _parcelID);
    }

    /**
     *  @notice Enables a buyer to initiate a purchase of a land parcel by sending the
     *  required Ether directly to the contract.
     *  @dev The buyer must send the exact sale price as Ether along with the transaction.
     *  The purchase will be pending until the seller confirms the sale.
     *  The function emits a PurchasePending event upon successful execution.
     *  The function reverts if the land is not registered or the incorrect Ether value is sent.
     *  @param _parcelID The unique identifier of the land parcel to purchase.
     */
    function initiatePurchase(string memory _parcelID) public payable {
        uint256 landPrice = lands[_parcelID].price;
        require(msg.value == landPrice, "Incorrect Ether value.");
        require(lands[_parcelID].owner != address(0), "Land not registered.");

        pendingPurchases[_parcelID] = payable(msg.sender);

        emit PurchasePending(msg.sender, _parcelID, msg.value);
    }

    /**
     *  @notice Allows the seller to confirm a pending land purchase, transferring ownership
     *  to the buyer and receiving the Ether payment.
     *  @dev The function uses the onlyLandOwner modifier to ensure the caller is the current
     *  landowner. The function emits a LandSold event upon successful execution.
     *  The function reverts if there is no pending purchase for the specified land parcel.
     *  @param _parcelID The unique identifier of the land parcel being sold.
     */
    function confirmSale(
        string memory _parcelID
    ) public onlyLandOwner(_parcelID) {
        address payable buyer = pendingPurchases[_parcelID];
        require(buyer != address(0), "No pending purchase for this land.");

        // Transfer the land to the new owner
        address payable oldOwner = lands[_parcelID].owner;
        lands[_parcelID].owner = buyer;

        // Update the ownerToLands mappings for both old and new owners
        removeLandFromOwner(oldOwner, _parcelID);
        ownerToLands[buyer].push(_parcelID);

        // Transfer the funds to the previous owner
        uint256 price = lands[_parcelID].price;
        oldOwner.transfer(price);

        // Clear the pending purchase
        delete pendingPurchases[_parcelID];

        emit LandSold(oldOwner, buyer, _parcelID, price);
    }

    /**
     *  removeLandFromOwner
     *  @notice This internal utility function is used to remove a land parcel from
     *  an owner's list of land parcels. It is called during the transfer and sale
     *  of land to ensure that the ownerToLands mapping is kept up to date.
     *  @dev The function iterates over the list of land parcels owned by a given
     *  address to find the specified parcel ID. Upon finding the parcel ID, it is
     *  removed from the list. This function modifies the state of the contract by
     *  updating the ownerToLands mapping.
     *  @param _owner The address of the current owner from whose list the land
     *  parcel will be removed.
     *  @param _parcelID The unique identifier of the land parcel to be removed
     *  from the owner's list.
     */
    function removeLandFromOwner(
        address _owner,
        string memory _parcelID
    ) internal {
        uint256 len = ownerToLands[_owner].length;
        for (uint256 i = 0; i < len; i++) {
            if (
                keccak256(bytes(ownerToLands[_owner][i])) ==
                keccak256(bytes(_parcelID))
            ) {
                ownerToLands[_owner][i] = ownerToLands[_owner][len - 1];
                ownerToLands[_owner].pop();
                break;
            }
        }
    }

    /**
     *  verifyLand
     *  @notice This function allows anyone to verify the details of a specific
     *  parcel of land. It fetches the ownership details, location, parcel ID,
     *  and price for the given parcel ID from the contract's storage and
     *  returns it to the caller. If no such parcel ID exists in the contract's
     *  storage, it will throw an exception and halt execution.
     *  @dev The function is read-only and does not modify the state of
     *  the contract.
     *  @param _parcelID A unique identifier for the parcel of land. This ID is
     *  used to find the land parcel within the contract's storage and return
     *  its details.
     *  @return owner The Ethereum address of the owner of the land parcel.
     *  @return location The geographical location of the land parcel.
     *  @return parcelID The unique identifier for the parcel of land.
     *  @return price The price of the land parcel in Ether.
     */
    function verifyLand(
        string memory _parcelID
    ) public view returns (address, string memory, string memory, uint256) {
        // Check if the land parcel is registered
        require(
            lands[_parcelID].owner != address(0),
            "This land parcel is not registered."
        );

        // Return the land details
        return (
            lands[_parcelID].owner,
            lands[_parcelID].location,
            lands[_parcelID].parcelID,
            lands[_parcelID].price
        );
    }

    /**
     *  listLandsByOwner
     *  @notice This function allows anyone to fetch a list of all parcel IDs
     *  owned by a particular address. This can be useful to track all
     *  properties owned by a single address and manage their land portfolio.
     *  @dev The function is read-only and does not modify the state of
     *  the contract.
     *  @param _owner The Ethereum address of the owner whose lands are to
     *  be listed.
     *  @return parcelIDs An array of strings containing the unique identifiers
     *  for each land parcel owned by the specified address.
     */
    function listLandsByOwner(
        address _owner
    ) public view returns (string[] memory) {
        return ownerToLands[_owner];
    }
}
