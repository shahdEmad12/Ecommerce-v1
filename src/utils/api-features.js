import { paginationFunction } from "./pagination.js"
export class APIFeatures {
    constructor(query, mongooseQuery){
        this.query = query
        this.mongooseQuery = mongooseQuery
    }

    pagination({page, size}) {
    const {limit, skip} = paginationFunction(page, size)
    this.mongooseQuery= this.mongooseQuery.limit(limit).skip(skip)
    return this
    }

    sort(sortBy) {
        if(!sortBy) { 
        this.mongooseQuery= this.mongooseQuery.sort({createdAt: -1})
        return this
        }
    const formula = sortBy.replace(/desc/g, -1).replace(/asc/g, 1).replace(/ /g, ':')
    const [key, value] = formula.split(':')
    this.mongooseQuery= this.mongooseQuery.sort({[key]: value})
    return this

    }

    search(search) {
        const queryFiler = {}

        if (search.title) queryFiler.title = { $regex: search.title, $options: 'i' }
        if (search.desc) queryFiler.desc = { $regex: search.desc, $options: 'i' }
        if (search.discount) queryFiler.discount = { $ne: 0 }
        if (search.priceFrom && !search.priceTo) queryFiler.appliedPrice = { $gte: search.priceFrom }
        if (search.priceTo && !search.priceFrom) queryFiler.appliedPrice = { $lte: search.priceTo }
        if (search.priceTo && search.priceFrom) queryFiler.appliedPrice = { $gte: search.priceFrom, $lte: search.priceTo }
        if (search.stock) queryFiler.stock = { $ne: 0 }
        if (search.goodRate) queryFiler.goodRate = { $gte: 3 }
        if (search.badRate) queryFiler.badRate = { $lte: 3.1 }

        this.mongooseQuery = this.mongooseQuery.find(queryFiler)
        return this
    }
/*
    filters(brandFilter) {

        const queryFilter = JSON.parse(
            JSON.stringify(filters).replace(
                /gt|gte|lt|lte|in|nin|eq|ne|regex/g,
                (operator) => `$${operator}`,
            ),
        )

        this.mongooseQuery.find(brandFilter)
        return this
    }*/
}