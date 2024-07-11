function search(query, queryString) {
    const keyword = queryString.keyword ? {
        name: {
            $regex: queryString.keyword,
            $options: "i",
        }
    } : {};

    query = query.find({ ...keyword });
    return query;
}

function filter(query, queryString) {
    const queryCopy = { ...queryString };

    // fields to remove for category
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach(key => delete queryCopy[key]);

    // price filter
    let queryStringModified = JSON.stringify(queryCopy);
    queryStringModified = queryStringModified.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

    query = query.find(JSON.parse(queryStringModified));
    return query;
}

function pagination(query, queryString, resultPerPage) {
    const currentPage = Number(queryString.page) || 1;
    const skipSchools = resultPerPage * (currentPage - 1);

    query = query.limit(resultPerPage).skip(skipSchools);
    return query;
}

module.exports = {
    search,
    filter,
    pagination
};
