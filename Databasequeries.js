import { openDatabase } from 'react-native-sqlite-storage';


const db = openDatabase({ name: 'PhotoGallery.db' });
    const createTableImage = () => {
        db.transaction(
            (txn) => {
                txn.executeSql(
                    `CREATE TABLE IF NOT EXISTS Image (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        path TEXT NOT NULL,
                        is_sync INTEGER NOT NULL DEFAULT 0,
                        capture_date DATE,
                        event_date DATE,
                        last_modified DATE,
                        location_id INTEGER,
                        is_deleted INTEGER NOT NULL DEFAULT 0,
                        hash TEXT NOT NULL,
                        FOREIGN KEY (location_id) REFERENCES Location(id)
                    )`,
                    [],
                    (sqlTxn, res) => {
                      console.log('Image table created successfully');
                    },
                    (error) => {
                      console.log('Error creating Image table: ' + error.message);
                    }
                  );
                  
            }
        );
    }

    const InsertImageData = (image) => {
      return new Promise((resolve, reject) => {
        createTableImage();
    
        db.transaction((txn) => {
          txn.executeSql(
            `INSERT INTO Image(path, capture_date, last_modified, hash) VALUES (?, ?, ?, ?)`,
            [image.path, image.capture_date, image.last_modified, image.hash],
            (t, res) => {
              console.log('✅ Image inserted successfully with ID:', res.insertId);
              resolve(res.insertId); 
            },
            (t, error) => {
              console.log('❌ Insert error:', error.message);
              reject(error);
            }
          );
        });
      });
    };
    
    
    

    const getAllImageData = (callback) => {
      const imageData = [];
      
      db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM Image',
          [],
          (t, res) => {
            for (let i = 0; i < res.rows.length; i++) {
              imageData.push(res.rows.item(i)); 
            }
            callback(imageData);
          },
          (error) => {
            console.log('Error fetching data: ', error.message);
          }
        );
      });
    };

    const getImageDetails = async (imageId) => {
      console.log("Fetching image details for ID:", imageId);
    
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `SELECT 
              i.id AS image_id,
              i.path AS image_path,
              i.capture_date,
              i.event_date,
              i.last_modified,
              i.is_sync,
              i.is_deleted,
              i.hash,
              i.location_id,
    
              p.id AS person_id,
              p.name AS person_name,
              p.gender,
              p.path AS person_path
    
            FROM Image i
            LEFT JOIN ImagePerson ip ON i.id = ip.image_id
            LEFT JOIN Person p ON ip.person_id = p.id
            WHERE i.id = ?;`,
            [imageId],
            (txObj, { rows }) => {
              if (rows.length === 0) {
                console.error("No image found with ID:", imageId);
                resolve(null);  // No data found
                return;
              }
    
              const persons = new Map();
              let imageData = null;
    
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                console.log('Raw location_id:', row.location_id);
                console.log('Type:', typeof row.location_id);
                
                if (!imageData) {
                  imageData = {
                    image_id: row.image_id,
                    image_path: row.image_path,
                    capture_date: row.capture_date,
                    event_date: row.event_date,
                    last_modified: row.last_modified,
                    is_sync: row.is_sync,
                    is_deleted: row.is_deleted,
                    hash: row.hash,
                    location_id: parseInt(row.location_id),
                    persons: [],
                  };
                }
    
                if (row.person_id && !persons.has(row.person_id)) {
                  persons.set(row.person_id, {
                    person_id: row.person_id,
                    person_name: row.person_name,
                    gender: row.gender,
                    person_path: row.person_path
                  });
                }
              }
    
              if (imageData) {
                imageData.persons = Array.from(persons.values());
              }
    
              resolve(imageData);
            },
            (txObj, error) => {
              console.error("SQL Error:", error);
              reject(error);
            }
          );
        });
      });
    };
    //edit data 
    const editData = async (imageId, latestValue, selectedEvents, eventDate, location) => {
      console.log('Selected events:', selectedEvents);
    
      const database = await db;
    
      // 1. Update people
      if (Array.isArray(latestValue)) {
        for (const person of latestValue) {
          const { name, gender, personPath } = person;
          try {
            await database.transaction(async (tx) => {
              await tx.executeSql(
                'UPDATE person SET name = ?, gender = ? WHERE path = ?',
                [name, gender, personPath]
              );
            });
            console.log(`✅ Updated person ${name}`);
          } catch (error) {
            console.error(`❌ Failed to update person ${name}:`, error.message);
          }
        }
      }
    
      // 2. Delete & re-insert image events
      if (selectedEvents && selectedEvents.length > 0) {
        try {
          await database.transaction(async (tx) => {
            await tx.executeSql(
              'DELETE FROM imageevent WHERE image_id = ?',
              [imageId]
            );
            console.log('✅ Deleted existing events for image:', imageId);
          });
    
          for (const eventId of selectedEvents) {
            const intEventId = parseInt(eventId, 10);
            try {
              await insertImageEvent(imageId, intEventId);
              console.log(`✅ Inserted event ${intEventId} for image ${imageId}`);
            } catch (error) {
              console.log(`❌ Failed to insert event ${intEventId}:`, error.message);
            }
          }
        } catch (error) {
          console.log('❌ Error handling image events:', error.message);
        }
      }
    
      // 3. Update event date or location
      try {
        if (eventDate) {
          await database.transaction(async (tx) => {
            await tx.executeSql(
              'UPDATE image SET event_date = ? WHERE id = ?',
              [eventDate, imageId]
            );
            console.log('✅ Event date updated');
          });
        }
    
        if (location) {
          console.log('Location:', location);
          await createLocationTable();
          const loc_id = await insertLocation({ name: location });
          await database.transaction(async (tx) => {
            await tx.executeSql(
              'UPDATE image SET location_id = ? WHERE id = ?',
              [loc_id, imageId]
            );
            console.log('✅ Location updated');
          });
        }
    
        if (!eventDate && !location) {
          console.log('No event date or location to update');
        }
      } catch (error) {
        console.log('❌ Error updating image fields:', error.message);
      }
    };
    
    //get data or details screen 
    const getImageData = async (imageId) => {
      const database = await db;
    
      let result = {
        image: null,
        people: [],
        events: [],
        location: null
      };
    
      try {
        // 1. Get image data
        await database.transaction(async (tx) => {
          const imageRes = await tx.executeSql(
            'SELECT * FROM image WHERE id = ?',
            [imageId]
          );
          if (imageRes[0].rows.length > 0) {
            result.image = imageRes[0].rows.item(0);
          }
        });
    
        // 2. Get people related to image (assuming path = image id or imagePath is stored)
        await database.transaction(async (tx) => {
          const peopleRes = await tx.executeSql(
            'SELECT * FROM person WHERE path = ?',
            [imageId] // adapt if path is something else
          );
          const people = [];
          for (let i = 0; i < peopleRes[0].rows.length; i++) {
            people.push(peopleRes[0].rows.item(i));
          }
          result.people = people;
        });
    
        // 3. Get events linked via imageevent
        await database.transaction(async (tx) => {
          const eventRes = await tx.executeSql(
            `SELECT e.* FROM event e
             JOIN imageevent ie ON e.id = ie.event_id
             WHERE ie.image_id = ?`,
            [imageId]
          );
          const events = [];
          for (let i = 0; i < eventRes[0].rows.length; i++) {
            events.push(eventRes[0].rows.item(i));
          }
          result.events = events;
        });
    
        // 4. Get location if exists
        if (result.image && result.image.location_id) {
          await database.transaction(async (tx) => {
            const locRes = await tx.executeSql(
              'SELECT * FROM location WHERE id = ?',
              [result.image.location_id]
            );
            if (locRes[0].rows.length > 0) {
              result.location = locRes[0].rows.item(0);
            }
          });
        }
    
        console.log('✅ Full image data fetched:', result);
        return result;
    
      } catch (error) {
        console.error('❌ Failed to fetch image data:', error.message);
        throw error;
      }
    };
    

    
    
    
//person 

const createPersonTable = async () => {
  
  db.transaction((txn) => {
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS person (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT,
        gender TEXT NOT NULL DEFAULT 'U'
      )`, // <-- closing parenthesis added here
      [],
      (sqlTxn, res) => {
        console.log('Person table created successfully');
      },
      (sqlTxn, error) => {
        console.log('Error creating Person table: ' + error.message);
      }
    );
  });
};

  
const insertPerson = async ({person}) => {

  return new Promise((resolve, reject) => {
    // Ensure the Person table exists
    createPersonTable();

    db.transaction((txn) => {
      txn.executeSql(
        `INSERT INTO person (name, path, gender) VALUES (?, ?, ?)`,
        [person.name, person.path, person.gender],
        (t, res) => {
          // If insertion is successful, log the ID and resolve the promise with the personId
          const personId = res.insertId;
          console.log('Data Inserted Successfully, Person ID:', personId);
          resolve(personId);  // Return the personId
        },
        (error) => {
          // If there's an error, reject the promise
          console.error('Error inserting person:', error.message);
          reject(error);  // Reject with the error
        }
      );
    });
  });
};


    const getDataByID = () => {
        db.transaction((txn) => {
            txn.executeSql(
                `select * from Person where ID=?`,
                [ID],
                (t, res) => {
                    console.log(res.rows.item(0));
                    setName(res.rows.item(0).pName)
                },
                (error) => { console.log(error.message) }
            );
        });
    }
    const Reset = () => {
        setAllPersons(tempAllPerson.Reset)

    }
    const DeletetAllData = () => {
        
        db.transaction(txn => {
            txn.executeSql(
                'Delete from image ',
                [],
                (txn, res) => {
                    // var tempAllPerson = []
                    // for (i = 0; i < res.rows.length; i++) {
                    //     var p = { ID: res.rows.item(i).ID, pName: res.rows.item(i).pName };
                    //     tempAllPerson.push(p)
                    //     console.log(tempAllPerson)
                    // }
                    
                    // console.log(allPersons)
                },
                (error) => { }
            )
        })
    }
    const getLocationById = (id) => {
      return new Promise((resolve, reject) => {
          db.transaction(txn => {
              txn.executeSql(
                  'SELECT name FROM location WHERE id = ?',
                  [id],
                  (txn, res) => {
                      // If the location exists, resolve with the location name
                      if (res.rows.length > 0) {
                          const locationName = res.rows.item(0).name;
                          resolve(locationName); // Return the location name
                      } else {
                          reject('Location not found'); // Handle case if no location found
                      }
                  },
                  (error) => {
                      reject(`Error fetching location: ${error.message}`); // Handle SQL error
                  }
              );
          });
      });
  };
  
    
    
    //Event
    const createEventTable = async () => {
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS Event (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL
            );
          `);
        });
      };
      const insertEvent = async (name) => {
        createEventTable(); // Make sure the table exists
        
        if (!name) throw new Error('Event name is required.');
      
        const database = await db;
      
        return new Promise((resolve, reject) => {
          database.transaction(tx => {
            // Step 1: Check if event already exists
            tx.executeSql(
              'SELECT * FROM Event WHERE name = ?',
              [name],
              (txObj, resultSet) => {
                if (resultSet.rows.length > 0) {
                  // Event already exists
                  resolve('Event already exists.');
                } else {
                  // Step 2: Insert event
                  tx.executeSql(
                    'INSERT INTO Event (name) VALUES (?)',
                    [name],
                    (txObj, result) => resolve('Event inserted successfully.'),
                    (txObj, error) => reject(error)
                  );
                }
              },
              (txObj, error) => reject(error)
            );
          });
        });
      };
      
      
      const getAllEvents = async () => {
        const database = await db;
        return new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              `SELECT * FROM Event`,
              [],
              (tx, results) => {
                let events = [];
                for (let i = 0; i < results.rows.length; i++) {
                  events.push(results.rows.item(i));
                }
                resolve(events);
              },
              (tx, error) => { // <-- fix this
                reject(error); // now error will not be undefined
              }
            );
          });
        });
      };
      
      
      //imageevent

      const createImageEventTable = async () => {
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS imageEvent (
              image_id INTEGER,
              event_id INTEGER,
              PRIMARY KEY (image_id, event_id),
              FOREIGN KEY (image_id) REFERENCES image(id),
              FOREIGN KEY (event_id) REFERENCES event(id)
            );
          `);
        });
      };

      const insertImageEvent = async (image_id, event_id) => {
        createImageEventTable(); // Ensure the table exists
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(
            `INSERT INTO imageEvent (image_id, event_id) VALUES (?, ?)`,
            [image_id, event_id]
          );
        });
      };


      const getPersonTableColumns = async () => {
        return new Promise((resolve, reject) => {
          db.transaction((txn) => {
            txn.executeSql(
              "PRAGMA table_info(person);", // Query to get column info
              [], // No parameters for the query
              (txn, results) => {
                const columns = [];
                
                // Loop through results to collect column names
                for (let i = 0; i < results.rows.length; i++) {
                  columns.push(results.rows.item(i).name);
                }
                
                // Resolve the promise with the column names
                resolve(columns);
              },
              (error) => {
                // If there's an error, reject the promise with the error
                console.error('Error fetching column names:', error.message);
                reject(error);
              }
            );
          });
        });
      };
      //imageperson
      // const createImagePersonTable = async () => {
      //   const database = await db;
      //   await database.transaction(tx => {
      //     tx.executeSql(`
      //       CREATE TABLE IF NOT EXISTS imagePerson (
      //         image_id INTEGER NOT NULL,
      //         person_id INTEGER NOT NULL,
      //         PRIMARY KEY (image_id, person_id),
      //         FOREIGN KEY (image_id) REFERENCES image(id),
      //         FOREIGN KEY (person_id) REFERENCES person(id)
      //       );
      //     `);
      //   });
      // };
      const createImagePersonTable = async () => {
  
        db.transaction((txn) => {
          txn.executeSql(
            `CREATE TABLE IF NOT EXISTS imagePerson (
                       image_id INTEGER NOT NULL,
                       person_id INTEGER NOT NULL,
                       PRIMARY KEY (image_id, person_id),
                       FOREIGN KEY (image_id) REFERENCES image(id),
                       FOREIGN KEY (person_id) REFERENCES person(id)
            )`, 
            [],
            (sqlTxn, res) => {
              console.log('ImagePerson table created successfully');
            },
            (sqlTxn, error) => {
              console.log('Error creating Person table: ' + error.message);
            }
          );
        });
      };

      const linkImageToPerson = async ({ imageId, personId }) => {
        createImagePersonTable();
        console.log('linkImageToPerson', { imageId, personId });
      
        if (!imageId || !personId) {
          throw new Error('Both image_id and person_id are required.');
        }
      
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(
            `INSERT INTO imagePerson (image_id, person_id) VALUES (?, ?)`,
            [imageId, personId],
            () => console.log("✅ Linked image to person successfully"),
            (tx, error) => console.log("❌ Error linking image to person:", error.message)
          );
        });
      };
      

      const getPersonsForImage = async (image_id) => {
        const database = await db;
        return new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              `
              SELECT p.* FROM person p
              JOIN imagePerson ip ON p.id = ip.person_id
              WHERE ip.image_id = ?
              `,
              [image_id],
              (tx, results) => {
                let persons = [];
                for (let i = 0; i < results.rows.length; i++) {
                  persons.push(results.rows.item(i));
                }
                resolve(persons);
              },
              error => reject(error)
            );
          });
        });
      };
    


      
      const getImagesForPerson = async (person_id) => {
        const database = await db;
        return new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              `
              SELECT i.* FROM image i
              JOIN imagePerson ip ON i.id = ip.image_id
              WHERE ip.person_id = ?
              `,
              [person_id],
              (tx, results) => {
                let images = [];
                for (let i = 0; i < results.rows.length; i++) {
                  images.push(results.rows.item(i));
                }
                resolve(images);
              },
              error => reject(error)
            );
          });
        });
      };
      //location 

      const createLocationTable = async () => {
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS location (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              latitude REAL,
              longitude REAL
            );
          `);
        });
      };

      const insertLocation = async ({ name, latitude = null, longitude = null }) => {
        if (!name) throw new Error('Location name is required.');
      
        const database = await db;
      
        return new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              `INSERT INTO location (name, latitude, longitude) VALUES (?, ?, ?)`,
              [name, latitude, longitude],
              (_, result) => {
                console.log('✅ Location inserted with ID:', result.insertId);
                resolve(result.insertId); // return the new location ID
              },
              (_, error) => {
                console.error('❌ Failed to insert location:', error);
                reject(error);
              }
            );
          });
        });
      };
      

      //group by people 
      const getPeopleWithImages = async () => {
        const database = await db;
        return new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              `
             SELECT p.id,p.name, p.path AS image_path
FROM person p
JOIN imagePerson ip ON p.id = ip.person_id
JOIN image i ON i.id = ip.image_id
GROUP BY p.id;
`,

              [],
              (tx, results) => {
                let peopleWithImages = [];
                for (let i = 0; i < results.rows.length; i++) {
                  const row = results.rows.item(i);
                  const person = {
                    id: row.id,
                    name: row.name,
                    imagePath: row.image_path, // Only one image path
                  };
                  peopleWithImages.push(person);
                }
                resolve(peopleWithImages);
              },
              error => reject(error)
            );
              
             
          });
        });
      };
      const checkIfHashExists = async (hash) => {
        const database = await db;
        return new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              'SELECT id FROM image WHERE hash = ?',
              [hash],
              (_, { rows }) => {
                resolve(rows.length > 0); // true if exists
              },
              (_, error) => {
                console.error('❌ Hash check failed:', error);
                reject(error);
              }
            );
          });
        });
      };
      const getEventsByImageId = (imageId) => {
        return new Promise((resolve, reject) => {
            // Step 1: Fetch all event_id values related to the image from imageevent table
            db.transaction(txn => {
                txn.executeSql(
                    'SELECT event_id FROM imageevent WHERE image_id = ?',
                    [imageId],
                    (txn, res) => {
                        if (res.rows.length === 0) {
                            resolve([]);  // No events found, resolve with empty array
                            return;
                        }
    
                        // Collect all event IDs
                        const eventIds = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            eventIds.push(res.rows.item(i).event_id);
                        }
    
    
                        // Step 2: Fetch event names based on the event_ids from events table
                        if (eventIds.length > 0) {
                            // Create placeholders for the event_ids
                            const placeholders = eventIds.map(() => '?').join(',');
                            const query = `SELECT name FROM event WHERE id IN (${placeholders})`;
    
    
                            txn.executeSql(
                                query,
                                [...eventIds], // Spread the eventIds into individual parameters
                                (txn, res) => {
                                    const eventNames = [];
                                    for (let i = 0; i < res.rows.length; i++) {
                                        const event = res.rows.item(i);
                                        eventNames.push(event.name);  // Only push the event name
                                    }
    
                                    resolve(eventNames);  // Resolve with only event names
                                },
                                (txn, error) => {
                                    console.log("Error fetching event names:", error);
                                    reject(`Error fetching event names: ${error.message || error}`);  // Enhanced error message
                                }
                            );
                        } else {
                            resolve([]);  // No events found for this image
                        }
                    },
                    (txn, error) => {
                        console.log("Error fetching event_ids:", error);
                        reject(`Error fetching event IDs: ${error.message || error}`);  // Enhanced error message
                    }
                );
            });
        });
    };
    
    
    
    

export { InsertImageData,getAllImageData,DeletetAllData,insertPerson,linkImageToPerson ,getPeopleWithImages,getPersonTableColumns,
  getImagesForPerson,insertEvent,getAllEvents,getImageDetails,editData,checkIfHashExists,getImageData,getLocationById,
  getEventsByImageId

};

