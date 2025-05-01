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
    const DeletetAllDataByid = () => {
        
        db.transaction(txn => {
            txn.executeSql(
                'Delete from person where id=?',
                [ID],
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
    
    const UpdateDataByid = () => {
        
        db.transaction(txn => {
            txn.executeSql(
                'Update person set name=? where id=?',
                [name,ID],
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
        await database.transaction(tx => {
          tx.executeSql(
            `INSERT INTO location (name, latitude, longitude) VALUES (?, ?, ?)`,
            [name, latitude, longitude]
          );
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
   

    


export { InsertImageData,getAllImageData,DeletetAllData,insertPerson,linkImageToPerson ,getPeopleWithImages,getPersonTableColumns,
  getImagesForPerson,insertEvent,getAllEvents,getImageDetails
};

