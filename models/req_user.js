let db = require('../db_start_engine')

class User{
	static create(user, cb){
		let q = db.query('INSERT INTO user(nom, prenom, email, mot_de_passe, type, anniversaire, jeton) VALUE (?)', [user], (err, result) =>{
			if (err){
				console.log(q.sql)
				throw err
			}
			cb(result.insertId)
		})
	}

	static getUser(clause, cb){
		let q=db.query('SELECT * FROM user WHERE '+clause, (err, result) =>{
			if (err) 
			{
				console.log(q.sql)
				throw err
			}
			cb(result[0])
		})
	}
    static getUserJoin(clause, cb){
        let q=db.query('SELECT * FROM user '+clause, (err, result) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result[0])
        })
    }

	static insertToken(token, id, cb){
		db.query('UPDATE user SET jeton=? WHERE id=?', [token, id], (err, result) =>{
			if (err) throw err
			cb(result.changedRows)
		})	
	}

	static updateUser(clause, cb){
		let q=db.query('UPDATE user SET '+clause, (err, result) =>{
			if (err) 
			{
				console.log(q.sql)
				throw err
			}
			cb(result.changedRows)
		})	
	}
	static getRoomForArt(clause, cb){
		let q = db.query('SELECT `rooms`.`id_room`, `rooms`.`userid`, `rooms`.`with_userid`, `user`.`id` '+
			', `user`.`nom`, `user`.`prenom`, `user`.`payment_module`, '+
            '`user_type`.`id_user_type`, `user_type`.`libelle` '+
            'FROM `rooms` '+
            'INNER JOIN `user` ON `user` .`id`=`rooms`.`with_userid` '+
            'INNER JOIN `user_type` ON `user_type`.`id_user_type`=`user`.`type` '+
			'WHERE '+clause, (err, result, fields) =>{
				if (err){
					console.log(q.sql)
					throw err
				}
				cb(result)
			});
	}
	static getRoomForPro(clause, cb){
		let q=db.query('SELECT `rooms`.`id_room`, `rooms`.`userid`, `rooms`.`with_userid`, `user`.`id`, '+
			'`user`.`nom`, `user`.`prenom`, `user`.`payment_module`, '+
            '`user_type`.`id_user_type`, `user_type`.`libelle` '+
            ' FROM `rooms` '+
            'INNER JOIN `user` ON `user` .`id`=`rooms`.`userid` '+
            'INNER JOIN `user_type` ON `user_type`.`id_user_type`=`user`.`type` '+
			'WHERE '+clause, (err, result, fields) =>{
			if (err) 
			{
				console.log(q.sql)
				throw err
			}
			cb(result)
		})
	}

	static createRoom(room, cb){
		let q = db.query('INSERT INTO rooms (userid, with_userid, cree_le) VALUE (?)', [room], (err, result) =>{
			if (err){
				console.log(q.sql)
				throw err
			}
			cb(result.insertId)
		})
	}

    static roomExist(userid, with_userid, cb)
    {
        let r = db.query('SELECT * FROM `rooms` WHERE (userid =? AND with_userid =?)', [userid, with_userid], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        })
    }

	static insertMessages(messages, cb){
		console.time("insert")
		let q = db.query('INSERT INTO messages (iduser_send, iduser_received, message_txt, id_room, id_type, created_at) VALUE (?)', [messages], (err, result) =>{
			if (err){
				console.log(q.sql)
				throw err
			}
			cb(result.insertId)
			console.timeEnd("insert")
		})
	}	

	static insertTypeM(type_message, cb){
		let r = db.query('INSERT INTO type_message (type_m, path) VALUE (?)', [type_message], (err, result) =>{
			if (err){
				console.log(r.sql)
				throw err
			}
			cb(result.insertId)
		})
	}
    static insertContactTypeM(type_message, cb){
        let r = db.query('INSERT INTO type_message (type_m, path, id_art) VALUE (?)', [type_message], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.insertId)
        })
    }
    static insertEventsInTypeMessage(table, cb){
        let r = db.query('INSERT INTO events_in_type_message (id_calendar_event, id_type_message) VALUE (?)', [table], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.affectedRows)
        })
    }
    static insertServicesInTypeMessage(table, cb){
      let r = db.query('INSERT INTO services_in_type_message (id_type_message, id_service) VALUE (?)', [table], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.affectedRows)
        })  
    }
	static getFirstPreviousMsgPro(room, number, cb)
    {
    	//console.time("select counting")
        let r = db.query('SELECT * FROM messages INNER JOIN rooms ON rooms.id_room=messages.id_room '+
        	'LEFT JOIN type_message ON messages.id_type = type_message.id_type_m '+ 
        	'LEFT JOIN user ON rooms.userid = user.id WHERE messages.id_room = ? '+
        	'ORDER BY created_at DESC LIMIT '+number, [room], (err, result) => {
            if(err){
            	console.log(r.sql)
                throw err;
              }
            cb(result);
            //console.timeEnd("select counting")
        });
    }
    static getFirstPreviousMsgArt(room, number, cb)
    {
    	//console.time("select counting")
        let r = db.query('SELECT * FROM messages INNER JOIN rooms ON rooms.id_room=messages.id_room '+
        	'LEFT JOIN type_message ON messages.id_type = type_message.id_type_m '+ 
        	'LEFT JOIN user ON rooms.with_userid = user.id WHERE messages.id_room = ? '+
        	'ORDER BY created_at DESC LIMIT '+number, [room], (err, result) => {
            if(err){
            	console.log(r.sql)
                throw err;
              }
            cb(result);
            //console.timeEnd("select counting")
        });
    }
    static getPreviousMsgArt(room, index, number, cb)
    {
    	//console.time("select counting")
        let r = db.query('SELECT * FROM messages INNER JOIN rooms ON rooms.id_room=messages.id_room '+
        	'LEFT JOIN type_message ON messages.id_type = type_message.id_type_m '+ 
        	'LEFT JOIN user ON rooms.with_userid = user.id WHERE messages.id_room = ? '+
        	'AND messages.id_message < '+index+' ORDER BY created_at DESC LIMIT '+number, [room], (err, result) => {
            if(err){
              	console.log(r.sql)
                throw err;
            }
            cb(result);
            //console.timeEnd("select counting")
        });
    }
    static getPreviousMsgPro(room, index, number, cb)
    {
    	//console.time("select counting")
        let r = db.query('SELECT * FROM messages INNER JOIN rooms ON rooms.id_room=messages.id_room '+
        	'LEFT JOIN type_message ON messages.id_type = type_message.id_type_m '+ 
        	'LEFT JOIN user ON rooms.userid = user.id WHERE messages.id_room = ? '+
        	'AND messages.id_message < '+index+' ORDER BY created_at DESC LIMIT '+number, [room], (err, result) => {
            if(err){
              	console.log(r.sql)
                throw err;
            }
            cb(result);
            //console.timeEnd("select counting")
        });
    }
    static getFirstPreviousMsgAdmin(room, id, len, cb)
    {
        let r = db.query('SELECT * FROM messages LEFT JOIN type_message ON messages.id_type = type_message.id_type_m '+
        	'LEFT JOIN user ON messages.iduser_send = user.id '+
        	'WHERE messages.id_room = ? AND (messages.iduser_send='+id+' OR messages.iduser_received='+id+') '+
        	'ORDER BY created_at DESC LIMIT '+len, [room], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static getEventsInTypeMessage(table, cb){
        let r = db.query('SELECT * FROM events_in_type_message '+
            'INNER JOIN calendar_event ON events_in_type_message.id_calendar_event = calendar_event.id_event '+
            'WHERE events_in_type_message.id_type_message = ?', [table], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static getUserInfoInTypeMessage(table, cb){
        let r = db.query('SELECT * FROM user '+
            'INNER JOIN type_message ON type_message.id_art = user.id '+
            'LEFT JOIN temp ON temp.id_type_message = type_message.id_type_m '+
            'WHERE type_message.id_type_m = ?', [table], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static getServicesInTypeMessage(table, cb){
        let r = db.query('SELECT * FROM services_in_type_message '+
            'INNER JOIN service ON service.id_service = services_in_type_message.id_service '+
            'WHERE services_in_type_message.id_type_message = ?', [table], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static getPreviousMsgAdmin(room, id, index, len, cb)
    {
        db.query('SELECT * FROM messages '+
            'LEFT JOIN type_message ON messages.id_type = type_message.id_type_m '+
        	'LEFT JOIN user ON messages.iduser_send = user.id '+
        	'WHERE messages.id_room = ? AND (messages.iduser_send='+id+' OR messages.iduser_received='+id+') '+
        	'AND messages.id_message < '+index+' ORDER BY created_at DESC LIMIT '+len, [room], (err, result) => {
            if(err)
                throw err;
            cb(result);
        });
    }
    static getInfoPro_etablissement(id_user, cb)
    {
        let r = db.query('SELECT `etablissement`.`id`, `etablissement`.`nom`, `etablissement`.`adresse`, '+
            '`etablissement`.`cp`, `etablissement`.`descr`, `etablissement`.`siret`, `etablissement`.`path_img`, '+
            '`tarification`.`id_tarification`, `tarification`.`prix_min`, `tarification`.`prix_h`, `tarification`.`nbr_h_min`, '+
            '`document`.`path`, '+
            '`profil`.`id_profil` '+
            'FROM `etablissement` INNER JOIN `profil` ON `profil`.`id_etablissement`=`etablissement`.`id` '+
            'LEFT JOIN `tarification` ON `tarification`.`id_tarification`=`profil`.`id_tarification` '+
            'LEFT JOIN `document` ON `document`.`id_profil`=`profil`.`id_profil` '+
            'WHERE `profil`.`id_user`=?', [id_user], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static infoPro_etablissement(tab, cb)
    {
        let r = db.query('INSERT INTO etablissement (nom, adresse, cp, descr, siret) VALUE (?)', [tab], (err, result) => {
            if(err){
            	console.log(r.sql)
                throw err;
            }
            cb(result.insertId);
        });
    }
    static infoPro_profil_empty(tab, cb)
    {
        let r = db.query('INSERT INTO profil (id_user, id_etablissement) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.insertId);
        });
    }
    static getAllEtablissement(ind, cb){
    	let q=db.query('SELECT `etablissement`.`id`, `etablissement`.`nom`, `etablissement`.`adresse`, `etablissement`.`cp`, '+
            ' `etablissement`.`descr`, `etablissement`.`path_img`, `profil`.`id_user`, `tarification`.`prix_h`, `service`.`type_service` ,'+
            '`villes_france_free`.`ville_longitude_deg`, `villes_france_free`.`ville_latitude_deg` '+
            'FROM `etablissement` INNER JOIN `profil` ON `profil`.`id_etablissement`=`etablissement`.`id` '+
            'INNER JOIN `tarification` ON `tarification`.`id_tarification`=`profil`.`id_tarification` '+
            'INNER JOIN `appartenir` ON `appartenir`.`id_user`=`profil`.`id_user` '+
            'INNER JOIN `service` ON `service`.`id_service`=`appartenir`.`id_service` '+
            'LEFT JOIN `villes_france_free` ON `etablissement`.`cp`=`villes_france_free`.`ville_code_postal` '+
            'WHERE `etablissement`.`id` > '+ind+' GROUP BY `etablissement`.`id`, `profil`.`id_user`, `service`.`type_service`, `villes_france_free`.`ville_longitude_deg`, `villes_france_free`.`ville_latitude_deg` LIMIT 800', (err, result, fields) =>{
			if (err) 
			{
				console.log(q.sql)
				throw err
			}1
			cb(result)
		})
    }
	static getEtablissement(iduser, cb){
		let q=db.query('SELECT COUNT(*) AS count FROM `etablissement` INNER JOIN `profil` ON `profil`.`id_etablissement`=`etablissement`.`id` WHERE `profil`.`id_user` = ?',[iduser] , (err, result, fields) =>{
			if (err) 
			{
				console.log(q.sql)
				throw err
			}
			cb(result[0].count)
		})
	}
    static getEtablissementInClause(ind, clause, cb){
        let q=db.query('SELECT `etablissement`.`id`, `etablissement`.`nom`, `etablissement`.`adresse`, `etablissement`.`cp`, `etablissement`.`descr`, `etablissement`.`path_img`, '+
            '`profil`.`id_profil`, `profil`.`id_user`, `profil`.`id_etablissement`, `profil`.`id_tarification`, '+
            '`user`.`id`, `user`.`disponibilite`, '+
            '`tarification`.`prix_h`, '+
            '`service`.`type_service`, '+
            '`villes_france_free`.`ville_longitude_deg`, `villes_france_free`.`ville_latitude_deg`,  `villes_france_free`.`ville_nom` '+
            'FROM `etablissement` '+
            'INNER JOIN `profil` ON `profil`.`id_etablissement`=`etablissement`.`id` '+
            'INNER JOIN `user` ON `user`.`id`=`profil`.`id_user` '+
            'INNER JOIN `appartenir` ON `appartenir`.`id_user`=`profil`.`id_user` '+
            'INNER JOIN `service` ON `service`.`id_service`=`appartenir`.`id_service` '+
            'INNER JOIN `tarification` ON `tarification`.`id_tarification`=`profil`.`id_tarification` '+
            'LEFT JOIN `villes_france_free` ON `etablissement`.`cp`=`villes_france_free`.`ville_code_postal` '+
            'WHERE '+clause+' AND `etablissement`.`id` > '+ind+' GROUP BY `etablissement`.`id` LIMIT 800', (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static update_etablissement(clause, cb)
    {
        let r = db.query('UPDATE etablissement INNER JOIN profil ON profil.id_etablissement=etablissement.id '+
            'SET '+clause, (err, result) => {
            if(err){
            	console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static get_services(clause, cb){
    	let r = db.query('SELECT * FROM service WHERE '+clause, (err, result) => {
            if(err){
            	console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static get_servicesOfPro(pro, cb){
        let r = db.query('SELECT `service`.`id_service`, `service`.`type_service`, `service`.`nom_service` FROM `service` '+
            'INNER JOIN `appartenir` ON `appartenir`.`id_service`=`service`.`id_service` '+
            'WHERE `appartenir`.`id_user`=?', [pro], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static get_devisOfPro(pro, cb){
        let r = db.query('SELECT `devis`.`id_devis`, `devis`.`name`, `devis`.`price_ttc` FROM `devis` '+
            'INNER JOIN `prestation` ON `prestation`.`id_dev`=`devis`.`id_devis` '+
            'WHERE `prestation`.`id_pro`=? AND ISNULL(`devis`.`date_send`) GROUP BY `devis`.`id_devis`', [pro], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static displayProfile(id_pro, cb){
    	let r = db.query('SELECT `profil`.`id_profil`, `profil`.`id_user`, `profil`.`id_etablissement`, `profil`.`id_tarification`, '+
            '`etablissement`.`nom`, `etablissement`.`adresse`, `etablissement`.`cp`, `etablissement`.`descr`, `etablissement`.`siret`, `etablissement`.`path_img` , '+
            '`user`.`id`, `user`.`type`, `user`.`email` '+
            'FROM `profil` '+
    		'INNER JOIN `etablissement` ON `etablissement`.`id`=`profil`.`id_etablissement` '+
    		'INNER JOIN `user` ON `user`.`id`=`profil`.`id_user` '+
            'WHERE `profil`.`id_user`='+id_pro+' GROUP BY `profil`.`id_profil`',
    		(err, result) => { 
    			if(err){
	            	console.log(r.sql)
	                throw err;
	            }
	            cb(result);
    	});
    }
    static getOffresForDisplay(id_pro, cb){
    	let r = db.query('SELECT * FROM `profil`'+ 
			'INNER JOIN `contenir` ON `contenir`.`id_profil_contenir`=`profil`.`id_profil` '+
			'INNER JOIN `offres` ON `offres`.`id_offre`=`contenir`.`id_offre_contenir` '+
            'INNER JOIN `appartenir` ON `appartenir`.`id_user`=`profil`.`id_user` '+
            'INNER JOIN `service` ON `service`.`id_service`=`appartenir`.`id_service` '+
            'WHERE `profil`.`id_user`='+id_pro+' GROUP BY `offres`.`id_offre`', 
			(err, result) =>{
				if(err){
	            	console.log(r.sql)
	                throw err;
	            }
	            cb(result);
		})
    }
    static getServicesForDisplay(id_pro, cb){
        let r = db.query('SELECT * FROM `profil` '+
            'INNER JOIN `appartenir` ON `appartenir`.`id_user`=`profil`.`id_user` '+
            'INNER JOIN `service` ON `service`.`id_service`=`appartenir`.`id_service` '+
            'INNER JOIN `user` ON `user`.`id`=`profil`.`id_user` '+
            'WHERE `profil`.`id_user`='+id_pro+' GROUP BY `service`.`id_service`',
            (err, result) => { 
                if(err){
                    console.log(r.sql)
                    throw err;
                }
                cb(result);
        });
    }
    static getDocumentsForDisplay(id_pro, cb){
       let r = db.query('SELECT * FROM `profil` '+
            'LEFT JOIN `document` ON `document`.`id_profil`=`profil`.`id_profil` '+
            'INNER JOIN `user` ON `user`.`id`=`profil`.`id_user` '+
            'WHERE `profil`.`id_user`='+id_pro+' AND `document`.`type`="image" GROUP BY `document`.`path`',
            (err, result) => { 
                if(err){
                    console.log(r.sql)
                    throw err;
                }
                cb(result);
        }); 
    }
    static getTarificationForDisplay(id_pro, cb){
       let r = db.query('SELECT * FROM `profil` '+
            'INNER JOIN `tarification` ON `tarification`.`id_tarification`=`profil`.`id_tarification` '+
            'INNER JOIN `user` ON `user`.`id`=`profil`.`id_user` '+
            'WHERE `profil`.`id_user`='+id_pro+' GROUP BY `tarification`.`id_tarification`',
            (err, result) => { 
                if(err){
                    console.log(r.sql)
                    throw err;
                }
                cb(result);
        }); 
    }
    static insertDisponibilite(dispo, cb){
        let r = db.query("INSERT INTO calendar_event(id_pro, id_artist, start, end, title) VALUE (?)",
            [dispo], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.insertId)
        })
    }
    static insertDisponibiliteTemp(dispo, cb){
        let r = db.query("INSERT INTO calendar_event(id_pro, id_artist, start, end, title, acceptation) VALUE (?)",
            [dispo], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.insertId)
        })
    }
    static insertTemp(table, cb){
        let r = db.query("INSERT INTO temp(action_ok, action_ko, id_user_dest, id_user_host, id_type_message) VALUE (?)",
            [table], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.insertId)
        })
    }
    static insertCalendar(tab, cb){
        let r = db.query('INSERT INTO calendar_event(title, start, end, id_pro) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.insertId);
        });
    }
    static get_calendar(id, cb){
        let r = db.query('SELECT * FROM calendar_event WHERE id_pro=?', [id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static drop_calendar(id){
        let r = db.query('DELETE FROM calendar_event WHERE id_event=?', [id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
        });
    }
    static update_calendar(start, end, id, cb){
        let r = db.query('UPDATE calendar_event SET start=?, end=? WHERE id_event=?', [start, end, id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static infoPro_tarification(tab, cb)
    {
        let r = db.query('INSERT INTO tarification (prix_min, prix_h, nbr_h_min) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.insertId);
        });
    }
    static infoPro_tarification_updateprofil(id_tarif, id_user, cb)
    {
        let r = db.query('UPDATE profil SET profil.id_tarification ='+id_tarif+' WHERE profil.id_user ='+id_user, (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static getTarification(iduser, cb){
        let q=db.query('SELECT COUNT(*) AS count FROM `tarification` '+
            'INNER JOIN `profil` ON `profil`.`id_tarification`=`tarification`.`id_tarification` '+
            'WHERE `profil`.`id_user`=?',[iduser] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result[0].count)
        })
    }
    static getDevis(id_devis, cb){
        let q=db.query('SELECT COUNT(*) AS count FROM `devis` '+
            'WHERE `devis`.`id_devis`=?',[id_devis] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result[0].count)
        })
    }
    static getPresta(id_dev, cb){
        let q=db.query('SELECT * FROM `prestation` '+
            'LEFT JOIN `service` ON `service`.`id_service`=`prestation`.`id_serv` '+
            'WHERE `prestation`.`id_dev`=? AND ISNULL(prestation.id_calendar)',[id_dev] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static getPrestaFromDevis(id_devis, cb){
        let q=db.query('SELECT * FROM `prestation` WHERE `prestation`.`id_dev`='+id_devis, (err, result) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err;
            }
            cb(result)
        })
    }
    static update_tarification(clause, cb)
    {
        let r = db.query('UPDATE tarification INNER JOIN profil ON profil.id_tarification=tarification.id_tarification '+
            'SET '+clause, (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static infoPro_offre(tab, cb)
    {
        let r = db.query('INSERT INTO offres (titre, spe_off, prix_off) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.insertId);
        });
    }
    static infoPro_content(tab, cb)
    {
        let r = db.query('INSERT INTO contenir(id_profil_contenir, id_offre_contenir) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.affectedRows);
        });
    }
    static getOffre(iduser, cb){
        let q=db.query('SELECT COUNT(*) AS count FROM `offres` INNER JOIN `contenir` ON `contenir`.`id_offre_contenir`=`offres`.`id_offre` INNER JOIN `profil` ON `profil`.`id_profil`=`contenir`.`id_profil_contenir` WHERE `profil`.`id_user`=?',[iduser] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result[0].count)
        })
    }
    static displayOffre(iduser, cb){
        let q=db.query('SELECT `contenir`.`id_offre_contenir`, `profil`.`id_profil`, `profil`.`id_user`, `offres`.`titre`, `offres`.`spe_off`, `offres`.`prix_off` FROM `profil` LEFT JOIN `contenir` ON `profil`.`id_profil`=`contenir`.`id_profil_contenir` LEFT JOIN `offres` ON `offres`.`id_offre`=`contenir`.`id_offre_contenir` WHERE `profil`.`id_user`=?',[iduser] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static update_offre(clause, cb)
    {
        let r = db.query('UPDATE offres SET '+clause, (err, result) => {
            //console.log(r.sql)
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static delete_offre(table, cb)
    {
        let r = db.query('DELETE FROM offres WHERE id_offre=?', [table], (err, result) => {
            //console.log(r.sql)
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.affectedRows);
        });
    }
    static displayServiceForPro(iduser, cb){
        let q=db.query('SELECT `service`.`id_service`, `service`.`nom_service` FROM `service` INNER JOIN `appartenir` ON `appartenir`.`id_service`=`service`.`id_service`  WHERE `appartenir`.`id_user`=?',[iduser] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static displayAllAudioServices(cb){
        let q=db.query('SELECT `service`.`id_service`, `service`.`nom_service` FROM `service`  WHERE `service`.`type_service`="audio"', (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static displayAllVideoServices(cb){
        let q=db.query('SELECT `service`.`id_service`, `service`.`nom_service` FROM `service`  WHERE `service`.`type_service`="video"', (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static insertPrestation(tablePrest, cb){
        let q=db.query('INSERT INTO `prestation` (id_calendar, descr, quantity, price_u, id_dev, id_serv, id_pro) VALUES (?)',[tablePrest] , (err, result) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result.insertId)
        })
    }
    static insertPrestationEmpty(tablePrest, cb){
        let q=db.query('INSERT INTO `prestation` (id_dev, id_pro) VALUES (?)',[tablePrest] , (err, result) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result.insertId)
        })
    }
    static insertDevis(tableD, cb){
        let q=db.query('INSERT INTO `devis` (date_send, total_ht, tva, price_ttc, name) VALUES (?)',[tableD] , (err, result) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result.insertId)
        })
    }
    static displayPresta(iduser, id_devis, cb){
        let q=db.query('SELECT `prestation`.`id_presta`, `prestation`.`descr`, `prestation`.`quantity`, `prestation`.`price_u`, `prestation`.`id_serv`, `prestation`.`id_dev` '+
            'FROM `prestation` WHERE `prestation`.`id_pro`=? AND `prestation`.`id_dev`='+id_devis ,[iduser] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static displayDevis(iduser, cb){
        let q=db.query('SELECT `devis`.`id_devis`, `devis`.`total_ht`, `devis`.`tva`, `devis`.`price_ttc`, `devis`.`name` '+
            'FROM `devis` INNER JOIN `prestation` ON `prestation`.`id_dev`=`devis`.`id_devis` '+
            'WHERE `prestation`.`id_pro`=? AND isNull(`devis`.`date_send`) GROUP BY `devis`.`id_devis`',[iduser] , (err, result, fields) =>{
            if (err)
            {
                console.log(q.sql)
                throw err
            }
            cb(result)
        })
    }
    static update_prestation(clause, cb)
    {
        let r = db.query('UPDATE prestation SET '+clause, (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static update_devis(clause, cb)
    {
        let r = db.query('UPDATE devis SET '+clause, (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static deleteServForPro(id_user, cb){
        let r = db.query('DELETE FROM `appartenir` WHERE `id_user`=? ', [id_user], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static addServForPro(table, cb){
        let r = db.query('INSERT INTO `appartenir` (`id_user`, `id_service`) VALUES (?)', [table], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.affectedRows);
        });
    }
    static insertCalendar(tab, cb){
        let r = db.query('INSERT INTO calendar_event (title, start, end, id_pro) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.insertId);
        });
    }
    static get_calendar(id, cb){
        let r = db.query('SELECT * FROM calendar_event WHERE id_pro=?', [id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static drop_calendar(id){
        let r = db.query('DELETE FROM calendar_event WHERE id_event=?', [id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
        });
    }
    static update_calendar(start, end, id, cb){
        let r = db.query('UPDATE calendar_event SET start=?, end=? WHERE id_event=?', [start, end, id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static insertDow(tab, cb){
        let r = db.query('INSERT INTO dow (userid, lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche, pause) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.insertId);
        });
    }
    static get_dow(id, cb){
        let r = db.query('SELECT * FROM dow WHERE userid=?', [id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static updateDow(lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche,pause,id,cb){
        let r = db.query('UPDATE dow SET lundi=?, mardi=?, mercredi=?, jeudi=?, vendredi=?, samedi=?, dimanche=?, pause=? WHERE userid=?', [lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche,pause,id], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.changedRows);
        });
    }
    static countDow(iduser, cb){
        let q=db.query('SELECT COUNT(*) AS count FROM `dow` AS r WHERE r.userid = ?',[iduser] , (err, result, fields) =>{
            if (err) 
            {
                console.log(q.sql)
                throw err
            }
            cb(result[0].count)
        })
    }
    static get_calendar_widget(clause,cb){
        let r = db.query('SELECT * FROM calendar_event WHERE '+clause+' ORDER BY RIGHT(start, 8)', [clause], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static get_dow_widget(clause, cb){
        let r = db.query(clause, [clause], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static getAllFrenchCities(cb){
        let r = db.query("SELECT * FROM villes_france_free", (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static getAllFrenchCp(cb){
        let r = db.query("SELECT ville_departement FROM villes_france_free GROUP BY ville_departement", (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static getFrenchCitiesInCp(cp, cb){
        let r = db.query("SELECT * FROM villes_france_free WHERE ville_departement=? ORDER BY ville_nom ASC, ville_code_postal ASC", [cp], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static insert_document(tab, cb){
        let r = db.query('INSERT INTO document(id_profil, type, path) VALUE (?)', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.affectedRows);
        });
    }
    static delete_document(tab, cb){
        let r = db.query('DELETE FROM document WHERE id_profil = ? AND type="image"', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.affectedRows);
        });
    }
    static get_document(tab, cb){
        let r = db.query("SELECT path FROM document WHERE id_profil=? AND type='image'", [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result);
        });
    }
    static delete_services_for_user(tab, cb){
        let r = db.query('DELETE FROM appartenir '+
            'WHERE appartenir.id_user = ?', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.affectedRows);
        });
    }
    static add_services(tab, cb){
        let r = db.query('INSERT INTO appartenir(id_user, id_service)  '+
            'VALUES (?) ', [tab], (err, result) => {
            if(err){
                console.log(r.sql)
                throw err;
            }
            cb(result.affectedRows);
        });
    }
    static delete_presta(tab, cb){
        let r = db.query('DELETE FROM prestation WHERE prestation.id_presta=?', [tab], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.affectedRows)
        })
    }
    static delete_devis(tab, cb){
        let r = db.query('DELETE FROM devis WHERE devis.id_devis=?', [tab], (err, result) =>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(result.affectedRows)
        })
    }
    static delete_tarification(tab, cb){
        let r = db.query('DELETE FROM `tarification` WHERE id_tarifiaction=?', [table], (err, res)=>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(res.affectedRows)
        })
    }
    static delete_etablissement(tab, cb){
       let r = db.query('DELETE FROM `etablissement` WHERE id=?', [table], (err, res)=>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(res.affectedRows)
        }) 
    }
    static delete_user(tab, cb){
        let r = db.query('DELETE FROM `user` WHERE id=?', [table], (err, res)=>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(res.affectedRows)
        })
    }
    static get_accept_action_module(tab, cb){
        let r = db.query('SELECT action_ok FROM `temp` WHERE id_type_message=?', [tab], (err, res)=>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(res)
        })
    }
    static get_deny_action_module(tab, cb){
        let r = db.query('SELECT action_ko FROM `temp` WHERE id_type_message=?', [tab], (err, res)=>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(res)
        })
    }
    static do_action_in_module(req, cb){
        let r = db.query(req, (err, res)=>{
            if (err){
                console.log(r.sql)
                throw err
            }
            cb(res)
        })
    }
}

module.exports = User