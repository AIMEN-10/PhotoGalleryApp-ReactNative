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

  
const insertPerson = async (person) => {
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
    const UpdateData = () => {
        
        db.transaction(txn => {
            txn.executeSql(
               'Update person set name=?',
                [name],
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
            CREATE TABLE IF NOT EXISTS event (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL
            );
          `);
        });
      };
      const insertEvent = async (name) => {
        if (!name) throw new Error('Event name is required.');
      
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(
            `INSERT INTO event (name) VALUES (?)`,
            [name]
          );
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
             SELECT p.*, GROUP_CONCAT(i.path) AS image_paths
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
                    name: row.name,
                    imagePaths: row.image_paths ? row.image_paths.split(',') : [],
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
    //useEffect(createTableImage, []);

    


export { InsertImageData,getAllImageData,DeletetAllData,insertPerson,linkImageToPerson ,getPeopleWithImages};

