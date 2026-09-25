def get_clarification_questions(crop, disease):
    """
    Generate rule-based clarification questions tailored to the detected crop and disease.
    """
    disease_lower = str(disease).lower()
    crop_lower = str(crop).lower()

    if disease_lower == "healthy":
        return [
            {
                "id": "healthy_check",
                "question_en": f"Do you see any yellowing, spots, or pest activity on other {crop} plants in your field?",
                "question_ta": f"உங்கள் வயலில் உள்ள மற்ற {crop} பயிர்களில் மஞ்சள் நிறம், புள்ளிகள் அல்லது பூச்சி தாக்குதல் ஏதேனும் தெரிகிறதா?",
                "options_en": ["No, all plants look healthy", "Yes, minor spots on lower leaves", "Yes, widespread yellowing"],
                "options_ta": ["இல்லை, அனைத்து பயிர்களும் ஆரோக்கியமாக உள்ளன", "ஆம், கீழ் இலைகளில் சிறிய புள்ளிகள்", "ஆம், பரவலான மஞ்சள் நிறம்"]
            }
        ]

    questions = [
        {
            "id": "duration",
            "question_en": f"How long have you noticed these symptoms on your {crop} crop?",
            "question_ta": f"உங்கள் {crop} பயிரில் இந்த அறிகுறிகளை எத்தனை நாட்களாக கவனிக்கிறீர்கள்?",
            "options_en": ["Less than 3 days", "3 to 7 days", "More than 1 week"],
            "options_ta": ["3 நாட்களுக்குக் குறைவாக", "3 முதல் 7 நாட்கள்", "1 வாரத்திற்கு மேல்"]
        },
        {
            "id": "spread",
            "question_en": f"Are the {disease} symptoms spreading to nearby plants or upper foliage?",
            "question_ta": f"{disease} அறிகுறிகள் அருகில் உள்ள பயிர்களுக்கு அல்லது மேல் இலைகளுக்கு பரவுகிறதா?",
            "options_en": ["Spreading rapidly across rows", "Confined to a few plants", "Isolated lower leaf spots only"],
            "options_ta": ["வரிசைகளாக வேகமாக பரவுகிறது", "சில பயிர்களில் மட்டும் உள்ளது", "கீழ் இலைகளில் மட்டும் உள்ளது"]
        },
        {
            "id": "severity",
            "question_en": "What percentage of the crop canopy or plot appears affected?",
            "question_ta": "பயிரின் எத்தனை சதவீதம் பாதிக்கப்பட்டதாகத் தெரிகிறது?",
            "options_en": ["Mild (Less than 10%)", "Moderate (10% - 30%)", "Severe (More than 30%)"],
            "options_ta": ["குறைவாக (10% க்கும் கீழ்)", "மிதமாக (10% - 30%)", "அதிகமாக (30% க்கும் மேல்)"]
        },
        {
            "id": "prior_treatment",
            "question_en": "Have you already sprayed any chemical or bio-pesticide on this field?",
            "question_ta": "இந்த வயலில் ஏற்கனவே ஏதேனும் ரசாயன அல்லது இயற்கை மருந்து தெளித்துள்ளீர்களா?",
            "options_en": ["No treatment applied yet", "Applied organic / Neem spray", "Applied chemical fungicide or insecticide"],
            "options_ta": ["எந்த மருந்தும் தெளிக்கப்படவில்லை", "இயற்கை / வேப்ப எண்ணெய் தெளிக்கப்பட்டது", "ரசாயன மருந்து தெளிக்கப்பட்டது"]
        }
    ]

    # Specific additional question for wilts and root/sheath issues
    if "wilt" in disease_lower or "blight" in disease_lower or "rot" in disease_lower:
        questions.append({
            "id": "moisture_condition",
            "question_en": "Has there been recent waterlogging or heavy rainfall in your field?",
            "question_ta": "உங்கள் வயலில் சமீபத்தில் நீர் தேங்குதல் அல்லது கனமழை இருந்ததா?",
            "options_en": ["Yes, standing water in field", "Normal moisture", "Dry / Drought stress"],
            "options_ta": ["ஆம், வயலில் தண்ணீர் தேங்கியுள்ளது", "சாதாரண ஈரப்பதம்", "வறட்சி / நீர் பற்றாக்குறை"]
        })

    return questions
