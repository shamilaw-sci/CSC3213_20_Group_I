import ProductBasicInfo from "./components_merchant/ProductBasicInfo";
import ProductDescription from "./components_merchant/ProductDescription";
import ProductHeader from "./components_merchant/ProductHeader";
import ProductImages from "./components_merchant/ProductImages";
import ProductPricing from "./components_merchant/ProductPricing";
import ProductVariants from "./components_merchant/ProductVariants";


export default function MerchantPage(){
    return(<>
        <ProductHeader></ProductHeader>
        <ProductImages></ProductImages>
        <ProductBasicInfo></ProductBasicInfo>
        <ProductDescription></ProductDescription>
        <ProductPricing></ProductPricing>
        < ProductVariants></ProductVariants>
        </>
    );
}