from database import save_disease_progress, get_disease_progress


success = save_disease_progress(
    crop="Banana",
    disease="Yellow Black Sigatoka",
    severity="Moderate",
    observation_date="2026-09-25",
    farmer_notes="Test record from AgriGuard",
    location="Farm Block 1"
)

if success:
    print("✅ Disease progress saved to MySQL!")
else:
    print("❌ Failed to save disease progress!")

print("\nStored records:")

records = get_disease_progress()

for record in records:
    print(record)