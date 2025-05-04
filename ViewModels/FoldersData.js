
import { getPeopleWithImages,getImagesGroupedByDate ,groupImagesByLocation,getImagesGroupedByEvent} from "../Databasequeries";


const FoldersData =async (data) => {
    
    const value = data?.data;
    console.log("here:",value); 
    if (value === "Person") {
        const groupbypersondata=await getPeopleWithImages();
        return groupbypersondata;
    }
    else if (value === "Event") {
       const groupbyeventdata=await getImagesGroupedByEvent();
        return groupbyeventdata;
     }
    else if( value === "Location") {
const groupbylocation=groupImagesByLocation();
return groupbylocation;
    }
    else if (value === "Date") {
        const groupbydatedata=await getImagesGroupedByDate();
        return groupbydatedata;
    }
    // else if (value === "Label") {
        
    // }
}
export default FoldersData;