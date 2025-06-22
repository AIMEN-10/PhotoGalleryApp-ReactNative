import { openDatabase } from 'react-native-sqlite-storage';


const db = openDatabase({ name: 'PhotoGallery.db' });
const createTableImage = () => {
  // db.transaction(
  //   (txn) => {
  //     txn.executeSql(
  //       `CREATE TABLE IF NOT EXISTS Image (
  //                       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //                       path TEXT NOT NULL,
  //                       is_sync INTEGER NOT NULL DEFAULT 0,
  //                       capture_date DATE,
  //                       event_date DATE,
  //                       last_modified DATETIME,
  //                       location_id INTEGER,
  //                       is_deleted INTEGER NOT NULL DEFAULT 0,
  //                       hash TEXT NOT NULL,
  //                       FOREIGN KEY (location_id) REFERENCES Location(id)
  //                   )`,
  //       [],
  //       (sqlTxn, res) => {
  //         console.log('Image table created successfully');
  //       },
  //       (error) => {
  //         console.log('Error creating Image table: ' + error.message);
  //       }
  //     );
  //
  //   }
  // );
  db.transaction((txn) => {
    // Step 1: Create the Image table
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS Image (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        is_sync INTEGER NOT NULL DEFAULT 0,
        capture_date DATE,
        event_date DATE,
        last_modified DATETIME,
        location_id INTEGER,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        hash TEXT NOT NULL,
        FOREIGN KEY (location_id) REFERENCES Location(id)
      );`,
      [],
      () => console.log('✅ Image table created'),
      (_, error) => { console.log('❌ Error creating Image table: ' + error.message); return true; }
    );

    // Step 2: Create the ImageHistory table
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS ImageHistory (
        id INTEGER,
        path TEXT NOT NULL,
        is_sync INTEGER NOT NULL DEFAULT 0,
        capture_date DATE,
        event_date DATE,
        last_modified DATETIME,
        location_id INTEGER,
        version_no INTEGER NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        hash TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        PRIMARY KEY (id, version_no),
        FOREIGN KEY (location_id) REFERENCES Location(id)
      );`,
      [],
      () => console.log('✅ ImageHistory table created'),
      (_, error) => { console.log('❌ Error creating ImageHistory table: ' + error.message); return true; }
    );

    // Step 3: Create the trigger for versioning
    txn.executeSql(
      `DROP TRIGGER IF EXISTS trg_UpdateImageHistory_new;`
    );

    txn.executeSql(
     `CREATE TRIGGER trg_UpdateImageHistory_new
AFTER UPDATE ON Image
BEGIN
  INSERT INTO ImageHistory (
    id, path, is_sync, capture_date, event_date, last_modified, location_id,
    version_no, is_deleted, hash, is_active, created_at
  )
  SELECT
    OLD.id,
    OLD.path,
    OLD.is_sync,
    OLD.capture_date,
    OLD.event_date,
    OLD.last_modified,
    OLD.location_id,
    IFNULL(
      (SELECT MAX(version_no) FROM ImageHistory WHERE id = OLD.id),
      0
    ) + 1,
    OLD.is_deleted,
    OLD.hash,
    0,
    datetime('now')
  ;
END;`,

      [],
      () => console.log('✅ Trigger created on Image updates'),
      (_, error) => { console.log('❌ Error creating trigger: ' + error.message); return true; }
    );
  });
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




//     const getAllImageData = () => {
//   return new Promise((resolve, reject) => {
//     const imageData = [];
//     db.transaction((txn) => {
//       txn.executeSql(
//         'SELECT * FROM Image',
//         [],
//         (t, res) => {
//           for (let i = 0; i < res.rows.length; i++) {
//             imageData.push(res.rows.item(i));
//           }
//           resolve(imageData);
//         },
//         (error) => {
//           console.log('Error fetching data: ', error.message);
//           reject(error);
//         }
//       );
//     });
//   });
// };
const getAllImageData = (callback) => {
  const imageData = [];

  db.transaction((txn) => {
    txn.executeSql(
      `SELECT * FROM Image WHERE is_deleted = 0` // Fetch only non-deleted images
      ,
      [],
      (t, res) => {
        for (let i = 0; i < res.rows.length; i++) {
          imageData.push(res.rows.item(i));
        }
        callback(imageData);
      },
      (t, error) => {
        console.log('Error fetching data: ', error.message);
        return true; // propagate the error
      }
    );
  });
};

const getAllImages = (callback) => {
  const imageData = [];

  db.transaction((txn) => {
    txn.executeSql(
      `SELECT *
FROM Image img
WHERE img.is_deleted = 0
  AND (
    img.event_date IS NULL OR TRIM(img.event_date) = ''
    OR img.location_id IS NULL OR TRIM(img.location_id) = ''
    OR EXISTS (
      SELECT 1
      FROM imageperson ip
      JOIN person p ON ip.person_id = p.id
      WHERE ip.image_id = img.id
        AND (
          TRIM(LOWER(p.name)) = 'unknown'
          OR p.name IS NULL
          OR p.gender IS NULL
          OR TRIM(LOWER(p.gender)) = 'u'
          OR p.dob IS NULL
          OR p.dob IS NULL

        )
    )
    OR NOT EXISTS (
      SELECT 1
      FROM imageevent ie
      WHERE ie.image_id = img.id
    )
  );
`
      ,
      [],
      (t, res) => {
        for (let i = 0; i < res.rows.length; i++) {
          imageData.push(res.rows.item(i));
        }
        callback(imageData);
      },
      (t, error) => {
        console.log('Error fetching data: ', error.message);
        return true; // propagate the error
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
              p.path AS person_path,
              p.DOB AS DOB,
              p.Age as Age
    
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
            // console.log('Raw location_id:', row.location_id);
            // console.log('Type:', typeof row.location_id);

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
                person_path: row.person_path,
                DOB: row.DOB,
                Age: row.Age
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
//edit data method 


const editDataForMultipleIds = async (imageIds, latestValue, selectedEvents, eventDate, location, last_modified) => {
  // Check if imageIds is an array or a single value
  if (Array.isArray(imageIds)) {
    // Case 1: When imageIds is a list, iterate over each ID
    for (const imageId of imageIds) {
      await editData(imageId, latestValue, selectedEvents, eventDate, location, last_modified);
    }
  } else {
    // Case 2: When imageIds is a single value, treat it as a single ID
    await editData(imageIds, latestValue, selectedEvents, eventDate, location, last_modified);
  }
};


//calling this for edit 
const editData = async (imageId, latestValue, selectedEvents, eventDate, location, last_modified) => {
  console.log('Selected events:', selectedEvents);
  console.log('database image idz', imageId)
  const database = await db;

  // 1. Update people
  if (Array.isArray(latestValue)) {
    for (const person of latestValue) {
      const { name, gender, DOB, Age, personPath } = person;
      const path = person?.path ?? personPath;
      try {
        await database.transaction(async (tx) => {
          await tx.executeSql(
            'UPDATE person SET name = ?, gender = ?,DOB=?,Age=? WHERE path = ?',
            [name, gender, DOB, Age, path]
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
  try {
    if (last_modified) {
      await database.transaction(async (tx) => {
        await tx.executeSql(
          'UPDATE image SET is_sync = 0,last_modified=? WHERE id = ?',
          [last_modified, imageId]

        );
        console.log('✅ Event date updated');
      });
    }
  }
  catch (error) {
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
  // db.transaction((txn) => {
  //   // Optional: Drop existing table (only if you don't need existing data)
  //   // txn.executeSql(`DROP TABLE IF EXISTS person`);

  //   txn.executeSql(
  //     `CREATE TABLE IF NOT EXISTS Person (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       name TEXT NOT NULL,
  //       path TEXT,
  //       gender TEXT NOT NULL DEFAULT 'U',
  //       DOB DATE,
  //       Age INT
  //     )`,
  //     [],
  //     () => {
  //       console.log('Person table created (with DOB and Age)');
  //     },
  //     (txn, error) => {
  //       console.log('Error creating Person table: ' + error.message);
  //     }
  //   );
  // });
  db.transaction((txn) => {
    // Step 1: Create Person table
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS Person (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT,
        gender TEXT NOT NULL DEFAULT 'U',
        DOB DATE,
        Age INT
      );`,
      [],
      () => console.log('✅ Person table created'),
      (_, error) => { console.log('❌ Error creating Person table: ' + error.message); return true; }
    );

    // Step 2: Create PersonHistory table
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS PersonHistory (
        id INTEGER,
        name TEXT NOT NULL,
        path TEXT,
        gender TEXT NOT NULL DEFAULT 'U',
        version_no INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        DOB DATE,
        Age INT
      );`,
      [],
      () => console.log('✅ PersonHistory table created'),
      (_, error) => { console.log('❌ Error creating PersonHistory table: ' + error.message); return true; }
    );

    // Step 3: Drop old trigger if exists
    txn.executeSql(`DROP TRIGGER IF EXISTS trg_UpdatePersonHistory_new;`);

    // Step 4: Create trigger for versioning
    txn.executeSql(
      `CREATE TRIGGER trg_UpdatePersonHistory_new
       AFTER UPDATE ON Person
       BEGIN
         INSERT INTO PersonHistory (
           id, name, path, gender, version_no, is_active, created_at, DOB, Age
         )
         SELECT
           OLD.id,
           OLD.name,
           OLD.path,
           OLD.gender,
           IFNULL((SELECT MAX(version_no) FROM PersonHistory WHERE id = OLD.id), 0) + 1,
           0,
           datetime('now'),
           OLD.DOB,
           OLD.Age;
       END;`,
      [],
      () => console.log('✅ Trigger created on Person update'),
      (_, error) => { console.log('❌ Error creating Person trigger: ' + error.message); return true; }
    );
  });

};




const insertPerson = async ({ person }) => {
  return new Promise((resolve, reject) => {
    // Ensure the Person table exists
    createPersonTable();

    db.transaction((txn) => {
      txn.executeSql(
        `INSERT INTO person (name, path,gender,DOB,Age) VALUES (?, ?, ?,?,?)`,
        [person.name, person.path, person.gender || 'U', person.DOB, person.Age],
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


const getDataByDate = (date) => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT id, path FROM Image WHERE capture_date = ? AND is_deleted = 0`,
        [date],
        (t, res) => {
          const images = [];

          // Loop through all rows and collect the images
          for (let i = 0; i < res.rows.length; i++) {
            const image = res.rows.item(i);
            images.push({ id: image.id, path: image.path });
          }

          if (images.length > 0) {
            resolve(images); // Return all images
          } else {
            resolve([]); // No images found for the date
          }
        },
        (error) => {
          console.error('SQL Error:', error.message);
          reject(error);
        }
      );
    });
  });
};




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
            // resolve('Event already exists.');
            const existingId = resultSet.rows.item(0).id;
            resolve({ message: 'Event already exists.', id: existingId });
          } else {
            // Step 2: Insert event
            tx.executeSql(
              'INSERT INTO Event (name) VALUES (?)',
              [name],
              // (txObj, result) => resolve('Event inserted successfully.'),
              (txObj, result) => {
                resolve({ message: 'Event inserted successfully.', id: result.insertId });
              },
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
  // await database.transaction(tx => {
  //   tx.executeSql(`
  //           CREATE TABLE IF NOT EXISTS imageEvent (
  //             image_id INTEGER,
  //             event_id INTEGER,
  //             PRIMARY KEY (image_id, event_id),
  //             FOREIGN KEY (image_id) REFERENCES image(id),
  //             FOREIGN KEY (event_id) REFERENCES event(id)
  //           );
  //         `);
  // });
  await database.transaction(tx => {
    // Step 1: Create imageEvent table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS imageEvent (
        image_id INTEGER,
        event_id INTEGER,
        PRIMARY KEY (image_id, event_id),
        FOREIGN KEY (image_id) REFERENCES image(id),
        FOREIGN KEY (event_id) REFERENCES event(id)
      );
    `);

    // Step 2: Create imageEventHistory table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS imageEventHistory (
        image_id INTEGER,
        event_id INTEGER,
        version_no INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now'))
      );
    `);

    // Step 3: Drop old trigger if exists
    tx.executeSql(`DROP TRIGGER IF EXISTS trg_UpdateImageEventHistory;`);

    // Step 4: Create trigger on DELETE
    tx.executeSql(`
  CREATE TRIGGER trg_UpdateImageEventHistory
  AFTER DELETE ON imageEvent
  BEGIN
    INSERT INTO imageEventHistory (
      image_id,
      event_id,
      version_no,
      is_active,
      created_at
    )
    VALUES (
      OLD.image_id,
      OLD.event_id,
      IFNULL(
        (SELECT MAX(version_no)
         FROM imageEventHistory
         WHERE image_id = OLD.image_id AND event_id = OLD.event_id),
        0
      ) + 1,
      0,
      datetime('now')
    );
  END;
`,
[],
() => console.log('✅ Trigger created on imageEvent'),
(_, error) => { console.log('❌ Error creating trigger: ' + error.message); return true; }
);
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
              SELECT i.* 
              FROM image i
              JOIN imagePerson ip ON i.id = ip.image_id
              WHERE ip.person_id = ? AND i.is_deleted = 0

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




const getAllLocations = async () => {
  const database = await db;
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM location;',
        [],
        (_, results) => {
          const locations = [];
          for (let i = 0; i < results.rows.length; i++) {
            locations.push(results.rows.item(i));
          }
          resolve(locations);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

const insertLocation = async ({ name, latitude = null, longitude = null }) => {
  if (!name) throw new Error('Location name is required.');

  const database = await db;

  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      // Step 1: Check if the location already exists
      tx.executeSql(
        `SELECT id FROM location WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) LIMIT 1`,
        [name],
        (_, selectResult) => {
          if (selectResult.rows.length > 0) {
            // Location already exists
            const existingId = selectResult.rows.item(0).id;
            console.log('✅ Location already exists with ID:', existingId);
            resolve(existingId);
          } else {
            // Step 2: Insert new location
            tx.executeSql(
              `INSERT INTO location (name, latitude, longitude) VALUES (?, ?, ?)`,
              [name, latitude, longitude],
              (_, insertResult) => {
                console.log('✅ Location inserted with ID:', insertResult.insertId);
                resolve(insertResult.insertId);
              },
              (_, insertError) => {
                console.error('❌ Failed to insert location:', insertError);
                reject(insertError);
              }
            );
          }
        },
        (_, selectError) => {
          console.error('❌ Failed to check for existing location:', selectError);
          reject(selectError);
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
WHERE i.is_deleted = 0
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
        'SELECT id, last_modified FROM image WHERE hash = ? AND is_deleted = 0',
        [hash],
        (_, { rows }) => {
          if (rows.length > 0) {
            const item = rows.item(0);
            resolve({ id: item.id, last_modified_date: item.last_modified });
          } else {
            resolve(null); // No match found
          }
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
//grouping 
const getImagesGroupedByDate = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Query without INNER JOIN to avoid crashes
      tx.executeSql(
        `
        SELECT capture_date, MIN(id) as min_id
        FROM Image
        WHERE is_deleted = 0
        GROUP BY capture_date
        ORDER BY capture_date DESC
        
        `,
        [],
        (tx, groupResults) => {
          if (groupResults.rows.length === 0) {
            resolve([]); // ✅ No images, return empty list
            return;
          }

          const placeholders = [];
          const ids = [];

          for (let i = 0; i < groupResults.rows.length; i++) {
            const row = groupResults.rows.item(i);
            placeholders.push('?');
            ids.push(row.min_id);
          }

          // Now get the image paths for those min_id values
          tx.executeSql(
            `SELECT id, capture_date, path FROM Image WHERE id IN (${placeholders.join(',')})`,
            ids,
            (tx, imageResults) => {
              const grouped = [];

              for (let i = 0; i < imageResults.rows.length; i++) {
                const row = imageResults.rows.item(i);
                grouped.push({
                  name: row.capture_date,
                  imagePath: row.path,
                });
              }

              // Sort by capture_date (in case IN doesn't preserve order)
              grouped.sort((a, b) => new Date(b.name) - new Date(a.name));

              resolve(grouped);
            },
            (tx, error) => {
              console.error('❌ Second query failed:', error?.message || error);
              reject(error);
            }
          );
        },
        (tx, error) => {
          // console.error('❌ First grouping query failed:', error?.message || error);
          // reject(error);
        }
      );
    });
  });
};

const groupImagesByLocation = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
            SELECT location.id AS location_id, location.name AS location_name, image.path
            FROM location
            JOIN image ON image.location_id = location.id
            WHERE image.is_deleted = 0
            ORDER BY location.id, image.id
            `,
        [],
        (tx, results) => {
          const grouped = [];
          const addedLocations = new Set();

          for (let i = 0; i < results.rows.length; i++) {

            const row = results.rows.item(i);
            // If this location hasn't been added yet, include its first non-deleted image
            if (!addedLocations.has(row.location_id)) {
              grouped.push({
                id: row.location_id,
                name: row.location_name,
                imagePath: row.path, // only one image
              });
              addedLocations.add(row.location_id);

            }
          }

          resolve(grouped);
        },
        (tx, error) => {
          console.error("❌ SQL Error:", error.message);
          reject(error);
        }
      );
    });
  });
};

const getImagesByLocationId = (locationId) => {
  return new Promise((resolve, reject) => {

    db.transaction(tx => {
      tx.executeSql(
        `
            SELECT id, path 
            FROM image 
            WHERE location_id = ? AND is_deleted = 0
            `,
        [locationId],
        (tx, results) => {
          const images = [];

          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            images.push({
              id: row.id,
              path: row.path
            });
          }

          resolve(images);
        },
        (tx, error) => {
          console.error('Error fetching images by location:', error.message);
          reject(error);
        }
      );
    });
  });
};


const getImagesGroupedByEvent = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 1. Get all events
      tx.executeSql(
        `SELECT id AS event_id, name AS event_name FROM Event`,
        [],
        (tx, eventResults) => {
          const groups = [];
          const totalEvents = eventResults.rows.length;

          if (totalEvents === 0) return resolve([]); // no events

          let processed = 0;

          for (let i = 0; i < totalEvents; i++) {
            const event = eventResults.rows.item(i);

            // 2. For each event, get one image where is_deleted = 0
            tx.executeSql(
              `
                  SELECT img.id AS image_id, img.path
                  FROM imageEvent ie
                  JOIN Image img ON img.id = ie.image_id
                  WHERE ie.event_id = ? AND img.is_deleted = 0
                  LIMIT 1
                  `,
              [event.event_id],
              (tx, imageResults) => {
                if (imageResults.rows.length > 0) {
                  const image = imageResults.rows.item(0);
                  groups.push({
                    name: event.event_name,
                    id: event.event_id,
                    imagePath: image.path,

                  });
                }

                processed++;
                if (processed === totalEvents) {
                  resolve(groups);
                }
              },
              (tx, error) => {
                console.error("Error fetching image for event:", error.message);
                processed++;
                if (processed === totalEvents) {
                  resolve(groups);
                }
              }
            );
          }
        },
        (tx, error) => {
          console.error("Error fetching events:", error.message);
          reject(error);
        }
      );
    });
  });
};
const getImagesByEventId = (eventId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
            SELECT img.id, img.path
            FROM imageEvent ie
            JOIN Image img ON img.id = ie.image_id
            WHERE ie.event_id = ? AND img.is_deleted = 0
            `,
        [eventId],
        (tx, results) => {
          const images = [];
          for (let i = 0; i < results.rows.length; i++) {
            images.push({
              id: results.rows.item(i).id,
              path: results.rows.item(i).path
            });
          }
          resolve(images);
        },
        (tx, error) => {
          console.error('Failed to fetch images by event ID:', error.message);
          reject(error);
        }
      );
    });
  });
};
const markImageAsDeleted = async (imageId) => {
  const database = await db;
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        `UPDATE image SET is_deleted = 1 WHERE id = ?`,
        [imageId],
        (tx, result) => {
          if (result.rowsAffected > 0) {
            resolve(true); // Successfully marked as deleted
          } else {
            resolve(false); // No image found with given ID
          }
        },
        error => {
          console.error("Error marking image as deleted:", error);
          reject(error);
        }
      );
    });
  });
};

//link
const createPersonLinksTable = async () => {
  db.transaction((txn) => {
    txn.executeSql(
      `CREATE TABLE IF NOT EXISTS person_links (
        person1_id INTEGER NOT NULL,
        person2_id INTEGER NOT NULL,
        PRIMARY KEY (person1_id, person2_id),
        FOREIGN KEY (person1_id) REFERENCES person(id),
        FOREIGN KEY (person2_id) REFERENCES person(id)
      )`,
      [],
      (sqlTxn, res) => {
        console.log('Person links table created successfully');
      },
      (sqlTxn, error) => {
        console.log('Error creating person links table: ' + error.message);
      }
    );
  });
};

const getAllPersonLinks = () => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT * FROM person_links`,
        [],
        (sqlTxn, res) => {
          const links = [];
          for (let i = 0; i < res.rows.length; i++) {
            links.push(res.rows.item(i));
          }
          resolve(links);
        },
        (sqlTxn, error) => {
          console.log('Error fetching person_links:', error.message);
          reject(error);
        }
      );
    });
  });
};

const insertPersonLinkIfNotExists = (person1_id, person2_id) => {
  createPersonLinksTable();

  db.transaction((txn) => {
    // Step 1: Fetch both persons
    txn.executeSql(
      `SELECT id, name, gender FROM person WHERE id IN (?, ?)`,
      [person1_id, person2_id],
      (sqlTxn, res) => {
        if (res.rows.length !== 2) {
          console.log('One or both persons not found.');
          return;
        }

        let person1 = null;
        let person2 = null;
        for (let i = 0; i < res.rows.length; i++) {
          const row = res.rows.item(i);
          if (row.id == person1_id) person1 = row;
          else if (row.id == person2_id) person2 = row;
        }

        // Ensure both are loaded
        if (!person1 || !person2) {
          console.log('Failed to retrieve both persons');
          return;
        }

        const name1 = person1.name.toLowerCase();
        const name2 = person2.name.toLowerCase();
        const isUnknown1 = name1 === 'unknown';
        const isUnknown2 = name2 === 'unknown';

        // Step 2: Apply update logic
        if (!isUnknown1 && isUnknown2) {
          // Replace unknown person2 with known person1
          txn.executeSql(
            `UPDATE person SET name = ?, gender = ? WHERE id = ?`,
            [person1.name, person1.gender, person2_id]
          );
        } else if (isUnknown1 && !isUnknown2) {
          // Replace unknown person1 with known person2
          txn.executeSql(
            `UPDATE person SET name = ?, gender = ? WHERE id = ?`,
            [person2.name, person2.gender, person1_id]
          );
        } else if (!isUnknown1 && !isUnknown2) {
          // Both are known — replace person1 with person2
          txn.executeSql(
            `UPDATE person SET name = ?, gender = ? WHERE id = ?`,
            [person2.name, person2.gender, person1_id]
          );
        }

        // Step 3: Check for existing link
        txn.executeSql(
          `SELECT * FROM person_links 
           WHERE (person1_id = ? AND person2_id = ?) 
              OR (person1_id = ? AND person2_id = ?)`,
          [person1_id, person2_id, person2_id, person1_id],
          (checkTxn, linkRes) => {
            if (linkRes.rows.length > 0) {
              console.log('Link already exists between', person1_id, 'and', person2_id);
            } else {
              // Insert new link
              txn.executeSql(
                `INSERT INTO person_links (person1_id, person2_id) VALUES (?, ?)`,
                [person1_id, person2_id],
                () => console.log('Link inserted successfully:', person1_id, person2_id),
                (insertTxn, error) => console.log('Error inserting link:', error.message)
              );
            }
          },
          (checkTxn, error) => {
            console.log('Error checking for existing link:', error.message);
          }
        );
      },
      (sqlTxn, error) => {
        console.log('Error retrieving persons:', error.message);
      }
    );
  });
};


// const insertPersonLinkIfNotExists = (person1_id, person2_id) => {
//   createPersonLinksTable();
//   db.transaction((txn) => {
//     // Step 1: Check if the link already exists (in either direction)
//     txn.executeSql(
//       `SELECT * FROM person_links 
//        WHERE (person1_id = ? AND person2_id = ?) 
//           OR (person1_id = ? AND person2_id = ?)`,
//       [person1_id, person2_id, person2_id, person1_id],
//       (sqlTxn, res) => {
//         if (res.rows.length > 0) {
//           console.log('Link already exists between', person1_id, 'and', person2_id);
//         } else {
//           // Step 2: Insert new link
//           txn.executeSql(
//             `INSERT INTO person_links (person1_id, person2_id) VALUES (?, ?)`,
//             [person1_id, person2_id],
//             (insertTxn, insertRes) => {
//               console.log('Link inserted successfully:', person1_id, person2_id);
//             },
//             (insertTxn, error) => {
//               console.log('Error inserting link:', error.message);
//             }
//           );
//         }
//       },
//       (sqlTxn, error) => {
//         console.log('Error checking for existing link:', error.message);
//       }
//     );
//   });
// };

//search 
const searchImages = (filters) => {
  return new Promise((resolve, reject) => {
    const {
      Names = [],
      Genders = [],
      Age = [],
      Locations = [],
      CaptureDates = [],
      SelectedEvents = {},
    } = filters;

    const clean = (arr) => arr.filter(val => val && val.toString().trim() !== '');
    const wrapValues = (arr) => clean(arr).map(v => `'${v.toString().replace(/'/g, "''")}'`).join(',');

    const nameStr = wrapValues(Names);
    const genderStr = wrapValues(Genders);
    const ageStr = wrapValues(Age);
    const locationStr = wrapValues(Locations);
    const dateStr = wrapValues(CaptureDates);

    const eventIds = Object.keys(SelectedEvents).filter(id => SelectedEvents[id]);
    const eventStr = wrapValues(eventIds);

    let query = `
      SELECT DISTINCT i.*
      FROM Image i
      JOIN imagePerson ip ON ip.image_id = i.id
      JOIN person p ON p.id = ip.person_id
      LEFT JOIN Location l ON l.id = i.location_id
      LEFT JOIN imageEvent ie ON ie.image_id = i.id
      LEFT JOIN Event e ON e.id = ie.event_id
      WHERE i.is_deleted = 0
    `;

    const conditions = [];

    // Person filters
    if (nameStr) conditions.push(`p.name IN (${nameStr})`);
    if (genderStr) conditions.push(`p.gender IN (${genderStr})`);
    if (ageStr) conditions.push(`p.Age IN (${ageStr})`);

    // Handle linked persons if name/gender/age provided
    if (conditions.length > 0) {
      const personSubquery = [];
      if (nameStr) personSubquery.push(`name IN (${nameStr})`);
      if (genderStr) personSubquery.push(`gender IN (${genderStr})`);
      if (ageStr) personSubquery.push(`Age IN (${ageStr})`);

      const personWhere = personSubquery.length > 0 ? personSubquery.join(' AND ') : '';

      query += `
        AND (
          (${conditions.join(' AND ')})
          OR p.id IN (
            SELECT person2_id FROM person_links WHERE person1_id IN (
              SELECT id FROM person WHERE ${personWhere}
            )
            UNION
            SELECT person1_id FROM person_links WHERE person2_id IN (
              SELECT id FROM person WHERE ${personWhere}
            )
          )
        )
      `;
    }

    // Other filters
    if (locationStr) query += ` AND l.name IN (${locationStr})`;
    if (dateStr) query += ` AND i.capture_date IN (${dateStr})`;
    if (eventStr) query += ` AND e.id IN (${eventStr})`;

    query += ` ORDER BY i.capture_date DESC;`;

    // Execute query
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (_, { rows }) => {
          const images = [];
          for (let i = 0; i < rows.length; i++) {
            images.push({
              id: rows.item(i).id,
              path: rows.item(i).path,
            });
          }
          resolve(images);
        },
        (_, error) => {
          console.error('❌ SQLite query error:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

//FOR GROUPING OF PERSON 
const getAllPersons = () => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT * FROM person`,
        [],
        (sqlTxn, res) => {
          let persons = [];
          for (let i = 0; i < res.rows.length; i++) {
            persons.push(res.rows.item(i));
          }
          resolve(persons);
        },
        (sqlTxn, error) => reject(error.message)
      );
    });
  });
};



const getImagePersonMap = () => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT * FROM imagePerson`,
        [],
        (sqlTxn, res) => {
          let map = [];
          for (let i = 0; i < res.rows.length; i++) {
            map.push(res.rows.item(i));
          }
          resolve(map);
        },
        (sqlTxn, error) => reject(error.message)
      );
    });
  });
};


const resetImageTable = () => {
  db.transaction(tx => {
    // Delete all data
    tx.executeSql(
      'DELETE FROM image;',
      [],
      () => console.log('All data deleted from image table'),
      (_, error) => console.log('Delete error: ', error)
    );

    // Reset auto-increment counter
    tx.executeSql(
      "DELETE FROM sqlite_sequence WHERE name = 'image';",
      [],
      () => console.log('Auto-increment reset for image table'),
      (_, error) => console.log('Reset error: ', error)
    );
  });
};




const getPersonAndLinkedList = (personId, callback) => {

  db.transaction(tx => {
    // Step 1: Get main person
    tx.executeSql(
      'SELECT * FROM person WHERE id = ?',
      [personId],
      (txObj, { rows }) => {
        if (rows.length === 0) {
          callback([], 404); // Not found
          return;
        }

        const mainPerson = rows.item(0);

        // Step 2: Get all linked person IDs (bidirectional)
        tx.executeSql(
          `SELECT person2_id AS linked_id FROM person_links WHERE person1_id = ?
           UNION
           SELECT person1_id AS linked_id FROM person_links WHERE person2_id = ?`,
          [personId, personId],
          (txObj, result) => {
            const linkedIds = [];
            for (let i = 0; i < result.rows.length; i++) {
              linkedIds.push(result.rows.item(i).linked_id);
            }

            if (linkedIds.length === 0) {
              // Only return the main person
              callback([mainPerson], 200);
              return;
            }

            // Step 3: Query linked persons
            const placeholders = linkedIds.map(() => '?').join(', ');
            tx.executeSql(
              `SELECT * FROM person WHERE id IN (${placeholders})`,
              linkedIds,
              (txObj, res2) => {
                const linkedPersons = [];
                for (let i = 0; i < res2.rows.length; i++) {
                  linkedPersons.push(res2.rows.item(i));
                }

                const allPersons = [mainPerson, ...linkedPersons];
                callback(allPersons, 200);
              },
              (txObj, error) => {
                console.log('Error fetching linked persons:', error.message);
                callback([], 500);
              }
            );
          },
          (txObj, error) => {
            console.log('Error fetching links:', error.message);
            callback([], 500);
          }
        );
      },
      (txObj, error) => {
        console.log('Error fetching main person:', error.message);
        callback([], 500);
      }
    );
  });
};
const getPersonData = (person_name) => {
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      txn.executeSql(
        `SELECT * FROM person where  name = ?`,
        [person_name],
        (sqlTxn, res) => {
          let persons = [];
          for (let i = 0; i < res.rows.length; i++) {
            persons.push(res.rows.item(i));
          }
          resolve(persons);
        },
        (sqlTxn, error) => reject(error.message)
      );
    });
  });
};

const updatePersonWhereEmbedding = async (person, embedding) => {
  const database = await db;

  await database.transaction(tx => {
    tx.executeSql(
      `UPDATE person 
       SET name = ? ,
       gender = ?,
       DOB = ?,
       Age = ?
       WHERE path = ?`,
      [person.name, person.gender, person.DOB, person.Age, embedding]
    );
  });
};

const handleUpdateEmbeddings = async (person, result) => {
  const embeddings = result.embeddings;

  for (const embedding of embeddings) {
    console.log(embedding);
    var emb = 'face_images/' + embedding;
    await updatePersonWhereEmbedding(person, emb);
  }
};

const createLink = async (person1_id, person2_id) => {
  createPersonLinksTable();

  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM person_links WHERE person1_id = ? AND person2_id = ?`,
      [person1_id, person2_id],
      (txObj, resultSet) => {
        if (resultSet.rows.length === 0) {
          // Link does not exist — insert it
          tx.executeSql(
            `INSERT INTO person_links (person1_id, person2_id) VALUES (?, ?)`,
            [person1_id, person2_id],
            (txObj2, resultSet2) => {
              console.log('Link inserted successfully with id:', resultSet2.insertId);
            },
            (txObj2, error2) => {
              console.error('Error inserting link:', error2);
            }
          );
        } else {
          console.log('Link already exists. Skipping insert.');
        }
      },
      (txObj, error) => {
        console.error('Error checking existing link:', error);
      }
    );
  });

}

const mergepeople = async = (person1_id, person2_emb) => {
  console.log('person id', person1_id, 'person2_emb', person2_emb);
  return new Promise((resolve, reject) => {
    db.transaction((txn) => {
      const person_path = 'face_images/' + person2_emb;

      txn.executeSql(
        `SELECT * FROM person WHERE path = ?`,
        [person_path],
        async (sqlTxn, res) => {
          if (res.rows.length > 0) {
            const person2_id = res.rows.item(0).id;
            console.log('Found person2_id:', person2_id);

            // Call createLink with both IDs
            await createLink(person1_id, person2_id);

            resolve({ person1_id, person2_id });
          } else {
            console.warn('No person found with path:', person_path);
            resolve(null);
          }
        },
        (sqlTxn, error) => {
          console.error('Error finding person2:', error.message);
          reject(error.message);
        }
      );
    });
  });

}
const getAllSyncImages = () => {
  return new Promise((resolve, reject) => {
    const finalResults = [];

    db.transaction((txn) => {
      // Step 1: Get images + location name
      txn.executeSql(
        `SELECT Image.*, Location.id AS location_id, Location.latitude, Location.longitude, Location.name AS location_name
 
         FROM Image 
         LEFT JOIN Location ON Image.location_id = Location.id 
         WHERE Image.is_deleted = 0 AND Image.is_sync = 0`,
        [],
        async (_, res) => {
          const imageRows = res.rows;
          const imagePromises = [];

          for (let i = 0; i < imageRows.length; i++) {
            const image = imageRows.item(i);
            const imageId = image.id;

            const imagePromise = new Promise((resolveImage) => {
              // Step 2: Fetch event names
              txn.executeSql(
                `SELECT Event.name 
                 FROM Event 
                 INNER JOIN ImageEvent ON Event.id = ImageEvent.event_id 
                 WHERE ImageEvent.image_id = ?`,
                [imageId],
                (_, resEv) => {
                  const events = [];
                  for (let j = 0; j < resEv.rows.length; j++) {
                    events.push(resEv.rows.item(j).name);
                  }

                  // Step 3: Fetch person names
                  txn.executeSql(
                    `SELECT Person.name ,person.path,person.gender
                     FROM Person 
                     INNER JOIN ImagePerson ON Person.id = ImagePerson.person_id 
                     WHERE ImagePerson.image_id = ?`,
                    [imageId],
                    (_, resPer) => {
                      const persons = [];
                      for (let k = 0; k < resPer.rows.length; k++) {
                        const personRow = resPer.rows.item(k);

                        persons.push({
                          name: personRow.name,
                          path: personRow.path,
                          gender: personRow.gender
                        });
                      }

                      // Final combined result
                      // resolveImage({
                      //   ...image,
                      //   location: image.location_name || '',
                      //   events,
                      //   persons,
                      // });
                      resolveImage({
                        id: image.id,
                        path: image.path,
                        capture_date: image.capture_date,
                        event_date: image.event_date,
                        hash: image.hash,
                        is_sync: Boolean(image.is_sync),
                        last_modified: image.last_modified,

                        location: image.location_name || image.latitude || image.longitude
                          ? [image.location_name || '', image.latitude || 0.0, image.longitude || 0.0]
                          : null,


                        events,

                        persons: persons.map((p, idx) => ({
                          id: idx + 1,          // Fake ID (replace with real if available)
                          name: p.name,
                          path: p.path,
                          gender: p.gender,
                          dob: p.dob,
                          age: p.age,
                        })),

                      });

                    },
                    (_, errPer) => {
                      console.log('Error fetching persons:', errPer.message);
                      resolveImage({ ...image, location: '', events: [], persons: [] }); // Fallback
                    }
                  );
                },
                (_, errEv) => {
                  console.log('Error fetching events:', errEv.message);
                  resolveImage({ ...image, location: '', events: [], persons: [] }); // Fallback
                }
              );
            });

            imagePromises.push(imagePromise);
          }

          // Wait for all images to resolve
          const results = await Promise.all(imagePromises);
          resolve(results);
        },
        (_, error) => {
          console.error('❌ Error in image query:', error.message);
          reject(error);
        }
      );
    },
      (txnErr) => {
        console.error('❌ Transaction error:', txnErr.message);
        reject(txnErr);
      });
  });
};


const createLinksIfNotExist = (links) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (txn) => {
        const promises = [];

        links.forEach((linkObj) => {
          if (!linkObj || Object.keys(linkObj).length === 0) return;

          Object.entries(linkObj).forEach(([path1, relatedPaths]) => {
            const linkPromise = new Promise((resolveLink) => {
              txn.executeSql(
                'SELECT id, name FROM Person WHERE path = ?',
                [path1],
                (_, res1) => {
                  if (res1.rows.length === 0) {
                    console.log(`❌ Person not found for path: ${path1}`);
                    return resolveLink();
                  }

                  const person1 = res1.rows.item(0);
                  const person1Id = person1.id;

                  const relatedTasks = relatedPaths.map(
                    (path2) =>
                      new Promise((resolveInner) => {
                        txn.executeSql(
                          'SELECT id, name FROM Person WHERE path = ?',
                          [path2],
                          (_, res2) => {
                            if (res2.rows.length === 0) {
                              console.log(`❌ Person not found for path: ${path2}`);
                              return resolveInner();
                            }

                            const person2 = res2.rows.item(0);
                            const person2Id = person2.id;

                            txn.executeSql(
                              `SELECT person1_id, person2_id FROM person_links 
   WHERE (person1_id = ? AND person2_id = ?) 
      OR (person1_id = ? AND person2_id = ?)`,
                              [person1Id, person2Id, person2Id, person1Id],
                              (_, resLink) => {
                                if (resLink.rows.length > 0) {
                                  console.log(`🔗 Link already exists between ${person1.name} and ${person2.name}`);
                                  return resolveInner();
                                }

                                txn.executeSql(
                                  'INSERT INTO person_links (person1_id, person2_id) VALUES (?, ?)',
                                  [person1Id, person2Id],
                                  () => {
                                    console.log(`✅ Link created between ${person1.name} and ${person2.name}`);
                                    resolveInner();
                                  },
                                  (_, errInsert) => {
                                    console.error('❌ Failed to insert link:', errInsert.message);
                                    resolveInner();
                                  }
                                );
                              },
                              (_, errLink) => {
                                console.error('❌ Error checking link:', errLink.message);
                                resolveInner();
                              }
                            );
                          },
                          (_, err2) => {
                            console.error('❌ Error getting person2:', err2.message);
                            resolveInner();
                          }
                        );
                      })
                  );

                  Promise.all(relatedTasks).then(() => resolveLink());
                },
                (_, err1) => {
                  console.error('❌ Error getting person1:', err1.message);
                  resolveLink();
                }
              );
            });

            promises.push(linkPromise);
          });
        });

        // Wait for all links to be processed
        Promise.all(promises)
          .then(() => {
            console.log('🎉 All links processed and committed.');
            resolve();
          })
          .catch((e) => {
            console.error('❌ Error during link processing:', e.message);
            reject(e);
          });
      },
      (txnErr) => {
        console.error('❌ Transaction error:', txnErr.message);
        reject(txnErr);
      }
    );
  });
};


const clearAllTables = async () => {
  const database = await db;

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      // 1. Disable foreign key constraints temporarily
      tx.executeSql('PRAGMA foreign_keys = OFF;');

      // 2. Get all user-defined table names
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
        [],
        (tx, results) => {
          const len = results.rows.length;

          // 3. Clear each table one by one
          for (let i = 0; i < len; i++) {
            const tableName = results.rows.item(i).name;
            tx.executeSql(`DELETE FROM "${tableName}";`, [], () => {
              console.log(`🧹 Cleared table: ${tableName}`);
            });
          }

          // 4. Optionally reset AUTOINCREMENT counters
          tx.executeSql('DELETE FROM sqlite_sequence;', [], () => {
            console.log('🔁 Autoincrement counters reset.');
          });

          // 5. Re-enable foreign keys
          tx.executeSql('PRAGMA foreign_keys = ON;', [], () => {
            console.log('✅ All tables cleared successfully.');
            resolve();
          });
        },
        (tx, error) => {
          console.error('❌ Failed to fetch table names:', error);
          reject(error);
        }
      );
    });
  });
};

const getLatestImageVersions = async () => {
  const database = await db;

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT id, path, MAX(version_no) AS version_no
         FROM ImageHistory
         GROUP BY id;`,
        [],
        (_, results) => {
          const rows = results.rows;
          let latestImages = [];

          for (let i = 0; i < rows.length; i++) {
            latestImages.push(rows.item(i));
          }
          console.log('✅ Latest image versions fetched:', latestImages);
          resolve(latestImages);
        },
        (_, error) => {
          console.log('❌ Error fetching latest image versions: ', error.message);
          reject(error);
        }
      );
    });
  });
};

const getImageDetailsUndo = async (imageId, version) => {
  console.log('🔍 Fetching historical image details for ID:', imageId, 'version:', version);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ImageHistory WHERE id = ? AND version_no = ?`,
        [imageId, version],
        (_, { rows }) => {
          if (rows.length === 0) {
            console.error('❌ No image history found');
            resolve(null);
            return;
          }

          const image = rows.item(0);
          const imageData = {
            [String(image.id)]: {
              path: image.path,
              is_sync: image.is_sync,
              capture_date: image.capture_date,
              event_date: image.event_date,
              last_modified: image.last_modified,
              hash: image.hash,
              persons_id: [],
              event_names: [],
              location: ['Location not found'],
            },
          };

          // PERSONS
          tx.executeSql(
            `SELECT ph.*
             FROM PersonHistory ph
             INNER JOIN ImagePerson ip ON ph.id = ip.person_id
             WHERE ip.image_id = ? AND ph.version_no = ?`,
            [imageId, version],
            (_, { rows }) => {
              const persons = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                persons.push({
                  id: row.id,
                  person_name: row.name,
                  gender: row.gender,
                  person_path: row.path,
                  DOB: row.DOB,
                  Age: row.Age,
                });
              }
              imageData[String(image.id)].persons_id = persons;
            }
          );

          // EVENTS
          tx.executeSql(
            `SELECT e.id, e.name
             FROM Event e
             INNER JOIN ImageEventHistory ieh ON e.id = ieh.event_id
             WHERE ieh.image_id = ? AND ieh.version_no = ?`,
            [imageId, version],
            (_, { rows }) => {
              const events = [];
              for (let i = 0; i < rows.length; i++) {
                events.push(rows.item(i).id);
              }
              imageData[String(image.id)].event_names = events;
            }
          );

          // LOCATION
          if (image.location_id) {
            tx.executeSql(
              `SELECT * FROM Location WHERE id = ?`,
              [image.location_id],
              (_, { rows }) => {
                if (rows.length > 0) {
                  const loc = rows.item(0);
                  imageData[String(image.id)].location = loc.name;

                }
              }
            );
          }

          // Artificial delay to allow nested queries to complete (not ideal but works)
          setTimeout(() => {
            console.log('✅ Image Data (Undo):', imageData);
            console.log('imagedd',imageData);
            resolve(imageData);
          }, 300); // Delay to ensure nested tx queries finish
        },
        (_, error) => {
          console.error('❌ SQL error while fetching ImageHistory:', error.message);
          reject(error);
          return true;
        }
      );
    });
  });
};
 const reactivateUndoHistory = (imageId, version, captureDate, lastModified) => {
  return new Promise((resolve) => {
    const createdAt = new Date(captureDate || lastModified || new Date());
    const delta = 5000;
    const lowerBound = new Date(createdAt.getTime() - delta).toISOString();
    const upperBound = new Date(createdAt.getTime() + delta).toISOString();

    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE ImageHistory SET is_active = 1 WHERE id = ? AND version_no = ?`,
        [imageId, version],
        () => console.log('✅ ImageHistory reactivated'),
        (_, error) => {
          console.error('❌ Failed to update ImageHistory:', error.message);
          return true;
        }
      );

      tx.executeSql(
        `UPDATE ImageEventHistory SET is_active = 1
         WHERE image_id = ? AND created_at BETWEEN ? AND ?`,
        [imageId, lowerBound, upperBound],
        () => console.log('✅ ImageEventHistory reactivated'),
        (_, error) => {
          console.error('❌ Failed to update ImageEventHistory:', error.message);
          return true;
        }
      );

      tx.executeSql(
        `UPDATE PersonHistory SET is_active = 1
         WHERE id IN (
           SELECT ph.id FROM PersonHistory ph
           INNER JOIN ImagePerson ip ON ph.id = ip.person_id
           WHERE ip.image_id = ? AND ph.version_no = ? AND ph.created_at BETWEEN ? AND ?
         )`,
        [imageId, version, lowerBound, upperBound],
        () => {
          console.log('✅ PersonHistory reactivated');
          resolve(true);
        },
        (_, error) => {
          console.error('❌ Failed to update PersonHistory:', error.message);
          resolve(false);
          return true;
        }
      );
    });
  });
};

export {
  createTableImage, createPersonTable, createImageEventTable,
  InsertImageData, getAllImageData, DeletetAllData, insertPerson, linkImageToPerson, getPeopleWithImages, getPersonTableColumns,
  getImagesForPerson, insertEvent, getAllEvents, getImageDetails, editDataForMultipleIds, checkIfHashExists, getImageData, getLocationById,
  getEventsByImageId, getImagesGroupedByDate, getDataByDate, groupImagesByLocation, getImagesByLocationId, getImagesGroupedByEvent,
  getImagesByEventId, markImageAsDeleted, getAllLocations, getAllPersonLinks, insertPersonLinkIfNotExists, searchImages,
  getAllPersons, getImagePersonMap, getPersonAndLinkedList, getPersonData, handleUpdateEmbeddings, getAllImages, mergepeople, getAllSyncImages,
  createLinksIfNotExist, getLatestImageVersions, getImageDetailsUndo,reactivateUndoHistory,

  resetImageTable, clearAllTables

};

