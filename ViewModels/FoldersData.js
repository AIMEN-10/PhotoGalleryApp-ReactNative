
import { getPeopleWithImages } from "../Databasequeries";


const FoldersData =async (data) => {
    
    const value = data?.data;
    console.log(value); 
    if (value === "Person") {
        const groupbypersondata=await getPeopleWithImages();
        return groupbypersondata;
    }
    else if (value === "Event") {
      
     }
    else if( value === "Location") {

    }
    else if (value === "Date") {

    }
    // else if (value === "Label") {
        
    // }
}
export default FoldersData;