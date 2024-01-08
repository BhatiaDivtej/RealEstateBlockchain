from brownie import LandRegistry, accounts, config, network

def initiate_purchase(buyer, parcel_id, price):
    land_registry = LandRegistry[-1]  # Fetch the latest deployed LandRegistry contract

    # The buyer initiates the land purchase
    tx = land_registry.initiatePurchase(parcel_id, {'from': buyer, 'value': price})
    tx.wait(1)
    
    print(f"Purchase for land with parcel ID {parcel_id} initiated by {buyer}.")
    return tx

def main():
    # Use buyer account
    buyer = accounts.add(config['wallets']['from_key_buyer'])
    
    # Dummy data for demonstration
    parcel_id = "kennedytown1"
    land_registry = LandRegistry[-1]
    
    # Access the land's details from the contract and then get its price
    land_details = land_registry.lands(parcel_id)
    land_price = land_details[3]

    # Call the initiate purchase function
    initiate_purchase(buyer, parcel_id, land_price)