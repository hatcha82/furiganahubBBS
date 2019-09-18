module.exports = (sequelize, DataTypes) => {
  const WowServerStatus = sequelize.define('WowServerStatus', {
    serverName: DataTypes.STRING,
    serverType : DataTypes.STRING,
    serverStatus: DataTypes.STRING,
  })

  WowServerStatus.associate = function (models) {
  }

  return WowServerStatus
}
