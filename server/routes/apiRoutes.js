const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const formController = require('../controllers/formController');

// --- AUTHENTICATION ROUTES ---
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/userinfo', authController.getUserInfo);

// --- DROPDOWN ROUTES ---
router.get('/states', formController.getStates);
router.get('/districts/:stateId', formController.getDistricts);

// --- ASTHA DIDI ROUTES ---
router.get('/asthadidi', formController.getAsthaDidi);
router.post('/asthadidi', formController.createAsthaDidi);
router.put('/asthadidi/:id', formController.updateAsthaDidi);
router.delete('/asthadidi/:id', formController.deleteAsthaDidi);

// --- DISTRICT ADMIN ROUTES (MAPPED TO dist_ngo_reg) ---
router.get('/districtadmin', formController.getDistrictAdmin);
router.post('/districtadmin', formController.createDistrictAdmin);
router.put('/districtadmin/:id', formController.updateDistrictAdmin);
router.delete('/districtadmin/:id', formController.deleteDistrictAdmin);

// --- SUPERVISOR ROUTES ---
router.post('/supervisor', formController.createSupervisor);

module.exports = router;