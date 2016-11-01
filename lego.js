'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var QUERY_PRIORITY = {
    filterIn: 0,
    sortBy: 1,
    or: 1,
    and: 1,
    select: 2,
    limit: 3,
    format: 4
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var result = collection.map(function (entry) {
        return Object.assign({}, entry);
    });
    var queries = [].slice.call(arguments, 1);

    queries
        .sort(function (a, b) {
            return a.priority > b.priority;
        })
        .forEach(function (query) {
            result = query(result);
        });

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var props = [].slice.call(arguments);

    var select = function (entries) {
        return entries.map(function (entry) {
            var result = {};

            props.forEach(function (prop) {
                if (entry.hasOwnProperty(prop)) {
                    result[prop] = entry[prop];
                }
            });

            return result;
        });
    };
    select.priority = QUERY_PRIORITY[select.name];

    return select;
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    var filterIn = function (entries) {
        return entries.filter(function (entry) {
            return values.includes(entry[property]);
        });
    };
    filterIn.priority = QUERY_PRIORITY[filterIn.name];

    return filterIn;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    var sortBy = function (entries) {
        return entries.sort(function (a, b) {
            return order === 'asc' ? a[property] > b[property] : a[property] < b[property];
        });
    };
    sortBy.priority = QUERY_PRIORITY[sortBy.name];

    return sortBy;
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    var format = function (entries) {
        entries.forEach(function (entry) {
            entry[property] = formatter(entry[property]);
        });

        return entries;
    };
    format.priority = QUERY_PRIORITY[format.name];

    return format;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    var limit = function (entries) {
        return entries.slice(0, count);
    };
    limit.priority = QUERY_PRIORITY[limit.name];

    return limit;
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

        var or = function (entries) {
            return entries.filter(function (entry) {
                return queries.some(function (query) {
                    return query(entries).includes(entry);
                });
            });
        };
        or.priority = QUERY_PRIORITY[or.name];

        return or;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        var queries = [].slice.call(arguments);

        var and = function (entries) {
            return entries.filter(function (entry) {
                return queries.every(function (query) {
                    return query(entries).includes(entry);
                });
            });
        };
        and.priority = QUERY_PRIORITY[and.name];

        return and;
    };
}
