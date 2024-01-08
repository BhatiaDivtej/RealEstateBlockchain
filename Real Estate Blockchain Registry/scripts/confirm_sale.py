from brownie import LandRegistry, accounts, config, network

def confirm_sale(seller, parcel_id):
    land_registry = LandRegistry[-1]  # Fetch the latest deployed LandRegistry contract

    # The seller confirms the sale
    tx = land_registry.confirmSale(parcel_id, {'from': seller})
    tx.wait(1)
    
    print(f"Sale for land with parcel ID {parcel_id} confirmed by {seller}.")
    return tx

def main():
    # Use seller account
    seller = accounts.add(config['wallets']['from_key_registrar'])
    
    # Dummy data for demonstration
    parcel_id = "kennedytown1"

    # Call the confirm sale function
    confirm_sale(seller, parcel_id)