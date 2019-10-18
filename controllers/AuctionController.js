const Auction = require('../models/Auction');

const AuctionController = () => {
  const createAuction = (req, res) => {
    const body = req.body;
    return Auction
    .create({
        auc_id: body.auc_id,
        starting_bid: body.starting_bid,
        data: body.data,
        seller_id: body.seller_id
    }).then(data => {
      res.status(200).json(data);
    }).catch((err) => {
      console.log(err);
      return res.status(500).json({ msg: 'Internal server error' });
    });
  };

  const getAuctionByAuctionID = (req, res) => {
      const body = req.body;
      const requestAuction_id = req.params.auc_id;
      return Auction
        .findAll({
          where: {
            auc_id:requestAuction_id
          }
        })
        .then((data) => res.status(200).json({data}))
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ msg: 'Internal server error' });
        });
  };

  const getAuctionByUserID = (req, res) => {
    const body = req.body;
    const requestUser_id = req.params.user_id;
    return Auction
      .findAll({
        where: {
          seller_id:requestUser_id
        }
      })
      .then((data) => res.status(200).json({data}))
      .catch((err) => {
        res.status(500).json({ msg: 'Internal server error' });
      });
  };

  const getAuctionByPage = (req, res) => {
    const limit = 30;   // number of records per page
    let offset = 0;
    const body = req.body;
    return Auction
    .findAndCountAll()
      .then((data) => {
        const page = req.params.page;      // page number
        const pages = Math.ceil(data.count / limit);
        offset = limit * (page - 1);
        Auction.findAll({
          attributes: ['auc_id', 'data'],
          limit,
          offset,
          $sort: { id: 1 }
        })
        .then((data) => {
          res.status(200).json({result: data, count: data.count, pages});
        });
      })
      .catch(error => {
        res.status(500).send('Internal Server Error');
      });
  };

  const updateAuction = (req, res) => {
      const body = req.body;
      return Auction
      .update ({
          auc_id: body.auc_id,
          starting_bid: body.starting_bid,
          data: body.data,
          seller_id: body.seller_id
        },
        {
          where: {
            auc_id: body.auc_id
          }
        })
        .then((data) => res.status(200).json({data}))
        .catch((err) => {
          res.status(500).json({ msg: 'Internal server error' });
        });
  };

  const removeAuction = (req, res) => {
      const body = req.body;
      return Auction
      .remove ({
          auc_id: body.auc_id,
          starting_bid: body.starting_bid,
          data: body.data,
          seller_id: body.seller_id
        },
        {where: { auc_id: body.auc_id}})
        .then((data) => res.status(200).json({data}))
        .catch((err) => {
          res.status(500).json({ msg: 'Internal server error' });
        });
    };


  return {
    createAuction,
    getAuctionByAuctionID,
    getAuctionByUserID,
    getAuctionByPage,
    updateAuction,
    removeAuction,
  };
};

module.exports = AuctionController;
