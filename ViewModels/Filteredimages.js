
import {
  getImagesForPerson, getDataByDate, getImagesByLocationId, getImagesByEventId, searchImages,
  getAllPersons, getAllImageData, getImagePersonMap, getAllPersonLinks

} from "../Databasequeries";


const Filteredimages = async (data) => {


  try {

    if (typeof data === 'string' && data.includes(';')) {
      const parts = data.split(';');
      switch (parts[0]) {
        case "Person":
          // return await getImagesForPerson(parts[1]);
          const getAllPersonDataAsJson = async () => {
            try {
              const persons = await getAllPersons();
              const images = await new Promise((resolve, reject) => {
                getAllImageData((data) => {
                  resolve(data);
                });
              });

              const image_person_map = await getImagePersonMap();
              const links = await getAllPersonLinks();

              const jsonData = {
                person_id: parts[1],
                persons,
                images,
                image_person_map,
                links,
              };

              // console.log("Full JSON Data:", JSON.stringify(jsonData, null, 2));
              return jsonData;
            } catch (error) {
              console.error("Error building JSON data:", error);
            }
          };

          const sendPersonGroupData = async () => {
            try {
              const data = await getAllPersonDataAsJson(); // Your combined data function

              const response = await fetch(`${baseUrl}get_person_images`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Server error');
              }

              const result = await response.json();
              // console.log('Response from backend:', JSON.stringify(result, null, 2));

              const simplifiedImages = result.images.map(img => ({
                id: img.id,
                path: img.path,
                persons:img.persons
              }));
             
              return simplifiedImages;

            } catch (error) {
              console.log('Failed to send data:', error);
            }
          };
          const result = await sendPersonGroupData();

          return result;

        case "Event":
          return await getImagesByEventId(parts[1]);
        case "Location":
          return await getImagesByLocationId(parts[1]);
        case "Date":
          return await getDataByDate(parts[2]);
        default:
          console.log("No matching condition found for data:", data);
          // const newparts = parts[0].split('*');
          const getAllPersonDataAsJson1 = async () => {
            try {
              const persons = await getAllPersons();
              const images = await new Promise((resolve, reject) => {
                getAllImageData((data) => {
                  resolve(data);
                });
              });

              const image_person_map = await getImagePersonMap();
              const links = await getAllPersonLinks();

              const jsonData = {
                person_id: parts[1],
                persons,
                images,
                image_person_map,
                links,
              };

              // console.log("Full JSON Data:", JSON.stringify(jsonData, null, 2));
              return jsonData;
            } catch (error) {
              console.error("Error building JSON data:", error);
            }
          };

          const sendPersonGroupData1 = async () => {
            try {
              const data = await getAllPersonDataAsJson1(); // Your combined data function

              const response = await fetch(`${baseUrl}get_person_images`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Server error');
              }

              const result = await response.json();
              // console.log('Response from backend:', JSON.stringify(result, null, 2));

              const simplifiedImages = result.images.map(img => ({
                id: img.id,
                path: img.path,
                persons:img.persons
              }));
             
              return simplifiedImages;

            } catch (error) {
              console.log('Failed to send data:', error);
            }
          };
          const result1 = await sendPersonGroupData1();
          console.log("resuuuuuuuuu",result1);
          return result1;

          
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