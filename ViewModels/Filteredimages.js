
import { getImagesForPerson, getDataByDate, getImagesByLocationId, getImagesByEventId, searchImages } from "../Databasequeries";


const Filteredimages = async (data) => {
   

  try {

    if (typeof data === 'string' && data.includes(';')) {
      const parts = data.split(';');
      switch (parts[0]) {
        case "Person":
          return await getImagesForPerson(parts[1]);
        case "Event":
          return await getImagesByEventId(parts[1]);
        case "Location":
          return await getImagesByLocationId(parts[1]);
        case "Date":
          return await getDataByDate(parts[2]);
        default:
          console.log("No matching condition found for data:", data); 
          return [];
      }
    } else {
      const images = await searchImages(data); 
      return images;
    }
  } catch (error) {
    console.error("Error in Filteredimages:", error);
    return [];
  }
};



// const Filteredimages = async (data) => {
//     console.log("Full Data:", data);
//     if (typeof data === 'string' && data.includes(';')) 
//     {

//         const parts = data.split(';');
//         if (parts[0] === "Person") {
//             //console.log("Person ID:", parts[1]); // <-- Add this
//             const images = await getImagesForPerson(parts[1]);
//             //console.log("Images for Person:", images); // <-- Add this
//             return images;
//         }
//         else if (parts[0] === "Event") {
//             const images = await getImagesByEventId(parts[1]);
//             return images;
//         }
//         else if (parts[0] === "Location") {
//             const images = await getImagesByLocationId(parts[1]);
//             return images;
//         }
//         else if (parts[0] === "Date") {
//             const images = await getDataByDate(parts[2]);
//             return images;
//         }


//         else {
//             console.log("No matching condition found for data:", data); 
//             return [];
//         }
//     }
//     else {
//         console.log('my code ');
//         const images = await searchImages(data);
//         return images;
//     }
// }
export default Filteredimages;