# Mapping between crop names used by the two datasets.

CROP_NAME_MAPPING = {
    "rice": "Rice",
    "maize": "Maize",
    "pigeonpeas": "Arhar",
    "mungbean": "Moong",
    "blackgram": "Urd",
    "lentil": "Masoor",
    "chickpea": "Gram",
    "kidneybeans": "Rajma",
    "mothbeans": "Moth",
    "coffee": "Coffee",
    "cotton": "Cotton",
    "jute": "Jute",
    "banana": "Banana",
    "mango": "Mango",
    "grapes": "Grapes",
    "watermelon": "Watermelon",
    "muskmelon": "Muskmelon",
    "pomegranate": "Pomegranate",
    "orange": "Orange",
    "papaya": "Papaya",
    "coconut": "Coconut",
    "apple": "Apple"
}


def map_crop_name(crop_name):
    """
    Convert the crop model's crop name into
    the compatibility dataset's crop name.
    """

    return CROP_NAME_MAPPING.get(
        crop_name.lower(),
        crop_name
    )