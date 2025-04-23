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
      createTableImage()
        db.transaction((txn) => {
            txn.executeSql(
                `insert into Image(path,capture_date,last_modified,hash) values(?,?,?,?)`,
                [image.path, image.capture_date, image.last_modified, image.hash],
                (t, res) => { console.log('Data Inserted Successfully'),image },
                (error) => { console.log(error.message) }
            )
        });
    }
    
    

    const getAllImageData = () => {
      const imageData = [];
      
      db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM Image',
          [],
          (t, res) => {
            console.log('Data fetched successfully', res.rows.raw());  // Logs the fetched rows
            for (let i = 0; i < res.rows.length; i++) {
              imageData.push(res.rows.item(i));  // Push each row into the imageData array
            }
          },
          (error) => {
            console.log('Error fetching data: ', error.message);
          }
        );
      });
    
      return imageData;  // Return the data collected (Note: due to the async nature of SQL, data may be fetched later)
    };
//person 

 const createPersonTable = async () => {
    const database = await db;
    await database.transaction(tx => {
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS person (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              path TEXT,
              gender TEXT NOT NULL DEFAULT 'U'
            );
          `);
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
                'Delete from person ',
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
      const createImagePersonTable = async () => {
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS imagePerson (
              image_id INTEGER NOT NULL,
              person_id INTEGER NOT NULL,
              PRIMARY KEY (image_id, person_id),
              FOREIGN KEY (image_id) REFERENCES image(id),
              FOREIGN KEY (person_id) REFERENCES person(id)
            );
          `);
        });
      };

      const linkImageToPerson = async (image_id, person_id) => {
        if (!image_id || !person_id) {
          throw new Error('Both image_id and person_id are required.');
        }
      
        const database = await db;
        await database.transaction(tx => {
          tx.executeSql(
            `INSERT INTO imagePerson (image_id, person_id) VALUES (?, ?)`,
            [image_id, person_id]
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

    


export { InsertImageData,getAllImageData };

