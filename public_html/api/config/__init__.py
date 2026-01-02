import pymysql

# Configure PyMySQL to work with Django
pymysql.version_info = (1, 4, 6, 'final', 0)
pymysql.install_as_MySQLdb()