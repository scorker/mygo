export function getFormattedAddress(data) {
    let formatted_address = '';
    let unit_name = data.address_unit_name;
    if(unit_name && unit_name !== '') {
        formatted_address = unit_name + ', ';
    }
    let street_number = data.address_street_number;
    if(street_number && street_number !== '') {
        formatted_address = formatted_address + street_number + ' ';
    }
    let street_name = data.address_street_name;
    if(street_name && street_name !== '') {
        formatted_address = formatted_address + street_name + ', ';
    }
    let city = data.address_city;
    if(city && city !== '') {
        formatted_address = formatted_address + city + ', ';
    }
    let state = data.address_state;
    if(state && state !== '') {
        formatted_address = formatted_address + state + ', ';
    }
    let country = data.address_country;
    if(country && country !== '') {
        formatted_address = formatted_address + country + ', ';
    }
    let postal_code = data.address_postal_code;
    if(postal_code && postal_code !== '') {
        formatted_address = formatted_address + postal_code;
    }
    return formatted_address;
}

export function getFormattedGradient(startColour, endColour) {
    if(!startColour) {
        startColour = 'rgba(0,0,0,0)';
    }
    if(!endColour) {
        endColour = 'rgba(0,0,0,1)';
    }
    return [startColour, endColour];
}