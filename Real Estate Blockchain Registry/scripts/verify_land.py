from brownie import LandRegistry, accounts, config

def verify_land(_parcelID):
    land_registry = LandRegistry[-1]
    return land_registry.verifyLand(_parcelID)

def main():
    # Dummy data for demonstration
    _parcelID = "kennedytown1"
    # _parcelID = "pokfulam1"

    land_info = verify_land(_parcelID)
    print(f"Land info: Owner: {land_info[0]}, Location: {land_info[1]}, Parcel ID: {land_info[2]}, Price: {land_info[3]}")