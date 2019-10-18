const Preferences = require('../../models/preferences');
const Op = Sequelize.Op

// { yearSpans: {start: 2000, end:2002}
// models: {make:'Audi', selectedModels:['A7','A8']},
// }

const preferencesController = () => {
    const getPreferences = (req, res) => {
        const fromYear = req.body.preferences.yearSpans.end
        const toYear = req.body.preferences.yearSpans.start
        const make = req.body.preferences.models.make
        const models = req.body.preferences.models.selectedModels
        // go to preferences table and retrieve matching rows
        Preferences.findAll({where:{
            fromYear: fromYear,
            toYear: toYear,
            make: make,
            model: {
                [Op.in]: models
            }
        }})
    }
}

module.exports = preferencesController