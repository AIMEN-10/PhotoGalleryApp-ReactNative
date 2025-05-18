
import {
  getPeopleWithImages, getImagesGroupedByDate, groupImagesByLocation, getImagesGroupedByEvent,
  getAllPersons, getAllImageData, getImagePersonMap, getAllPersonLinks
} from "../Databasequeries";


const FoldersData = async (data) => {

  const value = data?.data;
  console.log("here:", value);
  if (value === "Person") {
    // const groupbypersondata=await getPeopleWithImages();
    // return groupbypersondata;

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

        const response = await fetch(`${baseUrl}get_person_groups_from_json`, {
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
        console.log('Response from backend:', result);
      } catch (error) {
        console.error('Failed to send data:', error);
      }
    };
    const result = sendPersonGroupData();
    console.log(result);
  }
  else if (value === "Event") {
    const groupbyeventdata = await getImagesGroupedByEvent();
    return groupbyeventdata;
  }
  else if (value === "Location") {
    const groupbylocation = groupImagesByLocation();
    return groupbylocation;
  }
  else if (value === "Date") {
    const groupbydatedata = await getImagesGroupedByDate();
    return groupbydatedata;
  }
  // else if (value === "Label") {

  // }
}
export default FoldersData;