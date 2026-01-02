import pymysql

# Configure PyMySQL to work with Django (cPanel friendly, no compilation)
pymysql.install_as_MySQLdb()
