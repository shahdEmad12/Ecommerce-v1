import cloudinaryConnection from "../../utils/cloudinary.js"
import generateUniqueString from "../../utils/generate-Unique-String.js"
import SubCategory from '../../../DB/Models/sub-category.model.js'
import Brand from '../../../DB/Models/brand.model.js'
import Product from '../../../DB/Models/product.model.js'

import slugify from "slugify"

//............................... add brand ..................................
export const addBrand = async (req,res,next) => {
    // 1- desturcture the required data from teh request object
    const { name } = req.body
    // 2- destructing categoryid and subcategoryid from query
    const { categoryId, subCategoryId } = req.query
    // 3- destructing _id from the request authuser
    const { _id } = req.authUser

    // 4- subcategory check
    const subCategoryCheck = await SubCategory.findById(subCategoryId).populate('categoryId', 'folderId')
    if (!subCategoryCheck) return next({ message: 'SubCategory not found', cause: 404 })

    // 5- duplicate  brand document check 
    const isBrandExists = await Brand.findOne({ name, subCategoryId })
    if (isBrandExists) return next({ message: 'Brand already exists for this subCategory', cause: 400 })

    // 6- categogry check
    if (categoryId != subCategoryCheck.categoryId._id) return next({ message: 'Category not found', cause: 404 })

    // 7 - generate the slug
    const slug = slugify(name, '-')

    // 8- upload brand logo
    if (!req.file) return next({ message: 'Please upload the brand logo', cause: 400 })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,
    })

    // 9- generate the brand object
    const brandObject = {
        name, slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        subCategoryId,
        categoryId
    }

    // 10- create the brand
    const newBrand = await Brand.create(brandObject)

    res.status(201).json({
        status: 'success',
        message: 'Brand added successfully',
        data: newBrand
    })
}

//................................ update brand.................................
export const updateBrand = async (req,res,next) =>{
    // 1- destructure the required data from teh request object
    const {name, oldPublicId} = req.body
    // 2- destructing brandid from params
    const {brandId} = req.params
    // 3- destructing _id from the request authuser
    const {_id} = req.authUser

    // 4- check if the brand exists
    const isBrandExists = await Brand.findById(brandId)
    if (!isBrandExists) return next({ message: 'brand does not exist', cause: 404})

    // 5- check if its the brand owner
    if(!isBrandExists.addedBy.equals(req.authUser._id)) return next({ message: 'You are not the owner of this brand', cause: 401})

    // 6- update name
    if(name){
        //6.1 checks if the name sent is the same as the one exists
        if(name == isBrandExists.name) {
            return next({ cause: 400, message: 'Please enter different brand name from the existing one.' })
        }

        // 5.2 check if the new brand name is already exist in the database
        const isNameDuplicated = await Brand.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'brand name is already exist' })
        }
        // 5.3 set name value
        isBrandExists.name = name

        // 5.4 set slug value
        const slug = slugify(name, '-')
        isBrandExists.slug = slug
    }

    // 6 update images
    if(oldPublicId){
        if(!req.file) return next({ message: 'Please upload the brand logo', cause: 400 })

        const newPublicId = oldPublicId.split(`${isBrandExists.folderId}/`)[1]
        const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${isBrandExists.categoryId.folderId}/SubCategories/${isBrandExists.subCategoryId.folderId}/Brand/${isBrandExists.folderId}`,
            public_id: newPublicId
        })
        isBrandExists.Image.secure_url = secure_url

    }
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${isBrandExists.categoryId.folderId}/SubCategories/${isBrandExists.subCategoryId.folderId}/Brand/${isBrandExists.folderId}`

    // 7- set value for updatedby field
    isBrandExists.updatedBy = _id

    await isBrandExists.save()
    res.status(200).json({ success: true, message: 'brand updated successfully', data: isBrandExists })
}

//................................ delete brand.................................
export const deleteBrand = async (req,res,next) => {
    // 1- destructing brandid from params
    const {brandId} = req.params
    // 2- destructing _id from the request authuser
    const {_id} = req.authUser

    // 3- check if the brand exists and delete
    const isBrandExists = await Brand.findByIdAndDelete(brandId).populate('categoryId  subCategoryId')
    if (!isBrandExists) return next({ message: 'brand does not exist', cause: 404})

    // 4- delete related brands
    const products = await Product.deleteMany({brandId})
    if (products.deletedCount <= 0) {
        console.log(products.deletedCount);
        console.log('There is no related brands');
    }

    // 5- delete related images folder
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${isBrandExists.categoryId.folderId}/SubCategories/${isBrandExists.subCategoryId.folderId}/Brands/${isBrandExists.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${isBrandExists.categoryId.folderId}/SubCategories/${isBrandExists.subCategoryId.folderId}/Brands/${isBrandExists.folderId}`)

    res.status(200).json({ success: true, message: 'brand deleted successfully' })
}

//................................ get all brands.................................
export const getAllBrands = async (req,res,next) => {
    // find all brands
    const allBrands = await Brand.find()
    res.status(200).json({ success: true, message: 'brands fetched successfully', data: allBrands })
}