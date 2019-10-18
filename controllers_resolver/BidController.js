const Bids = require('../models/Bids');

const BidController = () => {
  const getAllBid = (req, res) => {
      return Bids
      .findAll()
      .then(data => {
        return res.status(200).json({data});
      })
      .catch(err => {
        return res.status(500).json({ msg: 'Internal server error' });
      })
  }

  const createBid = (req, res) => {
    const body = req.body;
    return Bids
    .create({
      amount: body.amount,
      createdAt: body.createdAt,
    })
    .then(data => {
      return res.status(200).json({ id: data.bid_id });
    })
    .catch(error => {
      return res.status(500).json({ msg: 'Internal server error' });
    });
  };

  const getBidByID = (req, res) => {
    const body = req.body;
    return Bids
    .findAll({
      where: { bid_id: req.params.bid_id }
    }).then(data => {
      return res.status(200).json({ data });
    }).catch(error => {
      return res.status(500).json({ msg: 'Internal server error' });
    })
  }

  return {
    getAllBid,
    createBid,
    getBidByID,
  };
};

module.exports = BidController;
