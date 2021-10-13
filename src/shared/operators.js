/**
 * Writes values from focus object onto base object.
 *
 * @param {Object} obj1 Base Object
 * @param {Object} obj2 Focus Object
 */
function wrap_object(original, target) {
    Object.keys(target).forEach((key) => {
        if (typeof target[key] == 'object') {
            if (Array.isArray(target[key])) return (original[key] = target[key]); // lgtm [js/prototype-pollution-utility]
            if (original[key] === null || typeof original[key] !== 'object') original[key] = {};
            wrap_object(original[key], target[key]);
        } else {
            original[key] = target[key];
        }
    });
}

module.exports = {
    wrap_object,
};
