
import SubCategory from "../../../DB/Models/sub-category.model.js"
import Category from '../../../DB/Models/category.model.js'
import generateUniqueString from "../../utils/generate-Unique-String.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import Brand from '../../../DB/Models/brand.model.js'

import slugify from "slugify"

//============================== add SubCategory ==============================//
export const addSubCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name } = req.body
    // 2- destructuring the request params
    const { categoryId } = req.params
    // 3- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 2- check if the subcategory name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'SubCategory name is already exist' })
        // return next( new Error('Category name is already exist' , {cause:409}) )
    }

    // 3- check if the category is exist by using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 4- generate the slug
    const slug = slugify(name, '-')

    // 5- upload image to cloudinary
    // 5.2 check if the image is sent to the cloudinary
    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    // 5.3 generate folderid
    const folderId = generateUniqueString(4)
    // 5.4 upload image to specified folder
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`


    // 6- generate the subCategory object
    const subCategory = {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        categoryId
    }
    // 7- create the subCategory
    const subCategoryCreated = await SubCategory.create(subCategory)
    req.savedDocuments = { model: SubCategory, _id: subCategoryCreated._id }
    res.status(201).json({ success: true, message: 'subCategory created successfully', data: subCategoryCreated })
}

//............................ update subCategory ................................
export const updateSubCategory = async (req,res,next) => {
    // 1- destructuring the request body
    const {name, oldPublicId} = req.body
    // 2- desrtructing subCategoryid from params
    const {subCategoryId} = req.params
    // 3- destructuring _id from the request authUser
    const {_id} = req.authUser

    // 4- checks if subCategory is exists
        const subCategory = await SubCategory.findById(subCategoryId)
        if (!subCategory) return next({ cause: 404, message: 'subcategory not found' })

        // 5- update name if sent 
        if(name){
            // 5.1 checks if the name sent is the same as the one exists
            if (name == subCategory.name) {
                return next({ cause: 400, message: 'Please enter different subcategory name from the existing one.' })
            }
    
            // 5.2 check if the new category name is already exist in the database
            const isNameDuplicated = await SubCategory.findOne({ name })
            if (isNameDuplicated) {
                return next({ cause: 409, message: 'subCategory name is already exist' })
            }
    
            // 5.3 update the category name and the category slug
            subCategory.name = name
            subCategory.slug = slugify(name, '-')
        }

        // 6- upload image to cloudinary
        if (oldPublicId) {
            if (!req.file) return next({ cause: 400, message: 'Image is required' })
            const newPulicId = oldPublicId.split(`${subCategory.folderId}/`)[1]

            const{ secure_url} = await cloudinaryConnection().uploader.upload(req.file.path, {
                folder: `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`,
                public_id: newPulicId
            })
            subCategory.Image.secure_url= secure_url
            req.folder = `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`
        }


        // set value for updatedby 
        subCategory.updatedBy = _id
        await subCategory.save()
        res.status(200).json({ success: true, message:'subcategory updated successfully', data: subCategory })
}

//.............................. delete sub categories ................................
export const deleteSubCategories = async (req,res,next) => {
    // 1- destructuring subCategoryid from params
    const {subCategoryId} = req.params
    // 2- destructuring _id from the request authUser
    const {_id} = req.authUser

    // 3- delete subcategory
    const subCategory = await SubCategory.findByIdAndDelete(subCategoryId)
    if (!subCategory) return next({ cause: 400, message:'deleting failed' })

    // 4- delete related brands
    const brands = await Brand.deleteMany({subCategoryId})
    if (brands.deletedCount <= 0) {
        console.log(brands.deletedCount);
        console.log('There is no related brands');
    }

    // 5- delete related images
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`)

    res.status(200).json({ success: true, message: 'subCategory deleted successfully' })
}

//.............................. get all subcategories with brands ................................
export const SubCategoriesWithBrand = async (req,res,next) => {
    // 1- find all subcategories with brands
    const getSubCategories = await SubCategory.find().populate([{path: 'Brands'}])
    res.status(200).json({ success: true, message: 'SubCategories with brands :', getSubCategories})
}