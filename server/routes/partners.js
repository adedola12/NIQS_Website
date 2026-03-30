const router = require('express').Router();
const { getAllPartners, getPartnerById, createPartner, updatePartner, deletePartner } = require('../controllers/partnerController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck, deleteCheck } = require('../middleware/roleCheck');

router.get('/',    getAllPartners);
router.get('/:id', getPartnerById);

router.post('/',    protect, adminOnly, roleCheck('main_admin', 'national_admin'), createPartner);
router.put('/:id',  protect, adminOnly, roleCheck('main_admin', 'national_admin'), updatePartner);
router.delete('/:id', protect, adminOnly, deleteCheck, deletePartner);

module.exports = router;
