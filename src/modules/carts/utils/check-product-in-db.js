
import Product from '../../../../DB/Models/product.model.js'

export function checkProductAvailability(productId, quantity){
    const product = Product.findById(productId)

    if(!product || product.stock < quantity) return null

    return product
}