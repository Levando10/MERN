import SummaryApi from "../common";
import SweetAlert from "sweetalert";

const addToCart = async(e,id) =>{
    e?.stopPropagation()
    e?.preventDefault()

    const response = await fetch(SummaryApi.addToCartProduct.url,{
        method : SummaryApi.addToCartProduct.method,
        credentials : 'include',
        headers : {
            "content-type" : 'application/json'
        },
        body : JSON.stringify(
            { productId : id }
        )
    })

    const responseData = await response.json()

    if(responseData.error){    
        SweetAlert(
            "Login Required!",
            "You need to login to add products to your cart.",
            "error"
        );
    }

    if(responseData.success){
        SweetAlert(
            "Product added successfully!",
            "Your product has been added to the listing.",
            "success"
        );
    }

    if(responseData.available){    
        SweetAlert(
            "Failed to add product!",
            "This product is already in your cart. You cannot add it again.",
            "error"
        );
    }


    return responseData

}


export default addToCart