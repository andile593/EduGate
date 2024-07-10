import { Query } from 'mongoose';

interface QueryString {
    keyword?: string;
    page?: string;
    limit?: string;
    [key: string]: any;
}

function search(query: Query<any[], any>, queryString: QueryString): Query<any[], any> {
    const keyword = queryString.keyword ? {
        name: {
            $regex: queryString.keyword,
            $options: "i",
        }
    } : {};

    query = query.find({ ...keyword });
    return query;
}

function filter(query: Query<any[], any>, queryString: QueryString): Query<any[], any> {
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

function pagination(query: Query<any[], any>, queryString: QueryString, resultPerPage: number): Query<any[], any> {
    const currentPage = Number(queryString.page) || 1;
    const skipProducts = resultPerPage * (currentPage - 1);

    query = query.limit(resultPerPage).skip(skipProducts);
    return query;
}

export { search, filter, pagination };
