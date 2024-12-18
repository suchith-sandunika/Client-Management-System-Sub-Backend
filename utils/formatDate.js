// Utility function to format the date to "day/month/year"
const formatDateToDMY = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}; 

const isDDMMYYYY = (date) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    return regex.test(date);
} 

const isDDMMYYYYWithDash = (date) => {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    return regex.test(date);
} 

const isYYYYMMDDWithSlash = (date) => {
    const regex = /^(\d{4})\/(\d{2})\/(\d{2})$/;
    return regex.test(date);
} 

const isYYYYMMDD = (date) => {
    const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
    return regex.test(date);
}

export { formatDateToDMY, isDDMMYYYY, isDDMMYYYYWithDash, isYYYYMMDDWithSlash, isYYYYMMDD };