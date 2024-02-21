import slugify from 'slugify'

import Brand from '../../../DB/Models/brand.model.js'
import Product from '../../../DB/Models/product.model.js'
import { systemRoles } from '../../utils/system-roles.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import { paginationFunction } from '../../utils/pagination.js'
import { APIFeatures } from '../../utils/api-features.js'

//................................. add products .................................
export const addProduct = async(req,res,next) => {
    // 1- destructuring the request body
    const { title, desc, basePrice, discount, stock, specs } = req.body
    // 2- destructuring the data in query 
    const { categoryId, subCategoryId, brandId } = req.query
    //3- destructuring the authuser data
    const addedBy = req.authUser._id

    // 4- check brand 
    const brand = await Brand.findById(brandId)
    if (!brand) return next({ cause: 404, message: 'Brand not found' })

    // 5- check category
    if(brand.categoryId.toString() !== categoryId) return next({ cause: 400, message: 'Brand not found in this category' })
    // 6- check subcategory
    if (brand.subCategoryId.toString() !== subCategoryId) return next({ cause: 400, message: 'Brand not found in this sub-category' })

    // 7- check who is authorized
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        brand.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to add a product to this brand' })

    // 8- generate slug
    const slug = slugify(title, {lower: true, replacement: '-'})

    // 9- calculate apllied price
    const appliedPrice = basePrice - (basePrice * (discount || 0) / 100)

    // 10 - upload images to cloudinary
    if(!req.files?.length) return next({ cause: 400, message: 'Images are required' })
    const Images = []
    const folderId = generateUniqueString(4)
    const folderPath = brand.Image.public_id.split(`${brand.folderId}/`)[0]

    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path, {
            folder: folderPath + `${brand.folderId}/Products/${folderId}`
        })
        Images.push({ secure_url, public_id })
    }
    req.folder = folderPath + `${brand.folderId}/Products/${folderId}`


        // prepare the product object for db 
        const product = {
            title, desc, slug, basePrice, discount, appliedPrice, stock, specs: JSON.parse(specs), categoryId, subCategoryId, brandId, addedBy, Images, folderId
        }
    
        const newProduct = await Product.create(product)
        req.savedDocuments = { model: Product, _id: newProduct._id }
    
        res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct })
}

//................................ update product ................................
export const updateProduct = async (req,res,next) => {
    // 1- destruct data from request body
    const { title, desc, basePrice, discount, stock, specs , oldPublicId} = req.body
    // 2- destruct data from params
    const {productId} = req.params
    // 3- destruct data from authUser
    const {_id} = req.authUser

    // 4- check if the product is exists
    const product = await Product.findById(productId)
    if (!product) return next({ cause: 404, message: 'Product not found' })

    // 5- checks who is authorized to update the product
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        product.addedBy.toString() !== _id.toString()
    ) return next({ cause: 403, message: 'You are not authorized to update this product' })

    // 6- update title
    if(title){
        //6.1 checks if the name sent is the same as the one exists
        if(title == product.title){return next({cause: 400, message: 'Please enter different product title from the existing one.'})}
        product.title = title

        // 6.2 generate slug and update
        const slug = slugify(title, {lower: true, replacement: '-'})
        product.slug = slug
        
    }

    // 7- set values to fields
    if (desc) product.desc = desc
    if (specs) product.specs = JSON.parse(specs)
    if (stock) product.stock = stock

    // 8- calculate apllied price
    const appliedPrice = (basePrice || product.basePrice) * (1 - ((discount || product.discount) / 100))
    product.appliedPrice = appliedPrice

    // 9- upload images to cloudinary
    if (oldPublicId){
        if(!req.file) return next({ cause: 400, message: 'Please select new image' })
        const folderPath = product.Images[0].public_id.split(`${product.folderId}/`)[0]
        const newPublicId = oldPublicId.split(`${product.folderId}/`)[1]
        const { secure_url} = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: folderPath + `${product.folderId}`,
            public_id: newPublicId
        })
        product.Images.map((img) =>{
            if(img.public_id === oldPublicId) {img.secure_url = secure_url}
        })
        req.folder = folderPath + `${product.folderId}`
    }

    // 10- save
    await product.save()

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product })
}

//................................. delete product.................................
export const deleteProduct = async (req, res, next) => {
    // 1- destruct data from params
    const {productId} = req.params
    // 2- destruct data from authUser
    const {_id} = req.authUser

    // 3- check if the product is exists and delete 
    const product = await Product.findByIdAndDelete(productId).populate('categoryId subCategoryId brandId')
    if (!product) return next({ cause: 404, message: 'Product not found' })

    // 4- checks who is authorized to delete the product
    if (
        req.authUser.role!== systemRoles.SUPER_ADMIN &&
        product.addedBy.toString()!== _id.toString()
    ) return next({ cause: 403, message: 'You are not authorized to delete this product' })

    // 5- delete related image folders
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${product.categoryId.folderId}/SubCategories/${product.subCategoryId.folderId}/Brands/${product.brandId.folderId}/Products/${product.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${product.categoryId.folderId}/SubCategories/${product.subCategoryId.folderId}/Brands/${product.brandId.folderId}/Products/${product.folderId}`)

    res.status(200).json({ success: true, message: 'Product deleted successfully' })
}

//............................... get products by id ................................

export const getProductById = async (req, res, next) => {
    const { productId } = req.params
    const product = await Product.findById(productId)
    if (!product) return next({ cause: 404, message: 'Product not found' })

    res.status(200).json({ success: true, message: 'Product fetched successfully', data: product })
}

//................................. search .................................
export const searchProducts = async (req, res, next) => {
    const { ...search } = req.query
    const searches = new APIFeatures(req.query, Product.find())
        .search(search)

    const products = await searches.mongooseQuery
    res.status(200).json({ success: true, data: products })
}

//................................. get all products .................................
export const getAllProducts = async (req, res, next) => {
    // 1- destruct data from query
    const {page, size} = req.query
    const features = new APIFeatures(req.query, Product.find()).pagination({page, size})
    // 3- get all products
    const products = await features.mongooseQuery

    res.status(200).json({ success: true, message: 'Products fetched successfully', data: products })
}


//............................... get two specific brands .............................

export const filterProducts = async (req, res, next) => {
    const { brand1, brand2 } = req.query
    const filters = await Product.find({ brand : {$in: [brand1, brand2] }})
    res.status(200).json({ success: true, data: filters })
}