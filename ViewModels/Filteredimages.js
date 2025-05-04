
import { getImagesForPerson,getDataByDate,getImagesByLocationId,getImagesByEventId} from "../Databasequeries";


const Filteredimages =async (data) => {
    //console.log("Full Data:", data); 
    const parts = data.split(';');
   
    if (parts[0]==="Person") {  
        //console.log("Person ID:", parts[1]); // <-- Add this
        const images=await getImagesForPerson(parts[1]);
        //console.log("Images for Person:", images); // <-- Add this
        return images;
}
else if (parts[0]==="Event") {
   const images=await getImagesByEventId(parts[1]);
    return images;
 }
else if( parts[0]==="Location") {
    const images=await getImagesByLocationId(parts[1]);
    return images;
}
else if(parts[0]==="Date") {
    const images=await getDataByDate(parts[2]);
    return images;
}

else {
console.log("No matching condition found for data:", data); // <-- Add this
    return []; // Return an empty array or handle the case as needed
}
}
export default Filteredimages;