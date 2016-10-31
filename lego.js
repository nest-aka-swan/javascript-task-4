'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

function isPropertyValid(property) {
    var validProperties = ['name', 'age', 'gender', 'email', 'phone', 'favoriteFruit'];

    return validProperties.includes(property);
}

function intersect(a, b) {
    var i;
    var helperObj = {};
    for (i = 0; i < b.length; i++) {
        helperObj[b[i]] = true;
    }

    var result = [];
    var value;
    for (i = 0; i < a.length; i++) {
        value = a[i];
        if (value in helperObj) {
            result.push(value);
        }
    }

    return result;
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var queries = [].slice.call(arguments, 1);
    var result = collection.map(function (entry) {
        return Object.assign({}, entry);
    });

    if (collection.length === 0) {
        return result;
    }

    var select;
    var limit = collection.length;
    var format = {};
    var queryResult;
    queries.forEach(function (query) {
        queryResult = query(result);

        if (queryResult.select && queryResult.select.length !== 0) {
            if (select) {
                select = intersect(select, queryResult.select);
            } else {
                select = queryResult.select;
            }
        }

        if (queryResult.limit) {
            limit = queryResult.limit;
        }

        if (queryResult.format) {
            format[queryResult.format.property] = queryResult.format.formatter;
        }

        result = queryResult.entries;
    });

    if (select) {
        result.forEach(function (entry) {
            for (var key in entry) {
                if (!select.includes(key)) {
                    delete entry[key];
                }
            }
        });
    }

    result.splice(limit);

    var fmtKeys = Object.keys(format);
    fmtKeys.forEach(function (key) {
        result.forEach(function (entry) {
            entry[key] = format[key](entry[key]);
        });
    });

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var selected = [].slice.call(arguments);

    return function (entries) {
        return {
            select: selected.filter(function (prop) {
                return isPropertyValid(prop);
            }),
            entries: entries
        };
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function (entries) {
        for (var i = entries.length - 1; i >= 0; i--) {
            if (!values.includes(entries[i][property])) {
                entries.splice(i, 1);
            }
        }

        return {
            entries: entries
        };
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function (entries) {
        entries.sort(function (a, b) {
            return order === 'asc' ? a[property] > b[property] : a[property] < b[property];
        });

        return {
            entries: entries
        };
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function (entries) {
        return {
            format: {
                property: property,
                formatter: formatter
            },
            entries: entries
        };
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(entries) {
        return {
            limit: count,
            entries: entries
        };
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function () {
        var queries = [].slice.call(arguments);

        return function (entries) {
            var result = [];
            var copy = Object.assign([], entries);

            queries.forEach(function (query) {
                entries = Object.assign([], copy);

                result = result.concat(query(entries).entries);
            });

            return {
                entries: result
            };
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        var queries = [].slice.call(arguments);

        return function (entries) {
            var result = {};

            queries.forEach(function (query) {
                result.entries = query(entries).entries;
            });

            return result;
        };
    };
}
