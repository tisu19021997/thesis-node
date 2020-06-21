const axios = require('axios');

// Recommender System
module.exports.uploadDataset = async (req, res) => {
  const { data, header } = req.body;
  const dataset = await data.map((dataPoint) => dataPoint.data);

  try {
    await axios.post(`${process.env.RECSYS_SERVER}/dataset`, {
      data: dataset,
      header,
    });
    return res.status(200)
      .send({ message: 'Done saving new dataset to server' });
  } catch (e) {
    return res.send(e);
  }
};

module.exports.backupDataset = async (req, res, next) => {
  const response = await axios.get(`${process.env.RECSYS_SERVER}/dataset`);

  return res.send(response.data);
};

module.exports.trainModel = async (req, res, next) => {
  let { dataset } = req.body;
  let dataHeader = [];
  const {
    model, params, trainType, saveOnServer, saveOnLocal,
  } = req.body;

  if (dataset.length) {
    dataHeader = dataset[0].meta.fields;
    dataset = await dataset.map((dataPoint) => dataPoint.data);
  }

  try {
    const response = await axios.post(`${process.env.RECSYS_SERVER}/models`,
      {
        dataset,
        dataHeader,
        model,
        params,
        trainType,
        saveOnServer,
        saveOnLocal,
      },
      {
        maxContentLength: 100000000,
        maxBodyLength: 100000000,
      });
    return res.send(response.data);
  } catch (e) {
    return next(e);
  }
};
