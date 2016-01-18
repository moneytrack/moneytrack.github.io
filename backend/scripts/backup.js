"use strict";
/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 18.01.2016 01:39
 */
var common = require("./_common")

var sender = new common.Sender();

var url = "http://ru-koluch-moneytrack-backend.appspot.com"

sender.get(url + "/login")

//sender.get("http://ru-koluch-moneytrack-backend.appspot.com/dispatch", {
//   "headers": {
//       "Cookie": "ACSID=AJKiYcGYX4e15Q_QzLOH5n27pzFf4ThuNdGek_-ATN5nkmlNkxqtD16dGFZh4KH5a0X9etJT5E-BHf7R2UvQrMsUjPdVvWTLnY1GHv9y_QziUT2TSuCRM7dRcZwOtsipv82SB0E1_r_8cx6LYRYw4_-Wt4LzkAWm33kSoz-K-pWddm7KiFjgi0mKne87U95oVyxdsCDkKrl-oi8W4KmP4Vsp-B7X_XpqP6zgy9Y0QyC0FqpNOmLsHFUiuG6ejuoo4BGEE4IUyfTM0g1MBEzUupHjJTCOOVI154jFhsIX8UD4VMqzyJXoK3FEnMhlTHusC4TC9HgkbCtr15LopEJ9gw-9d-ZrKqbr1THerVDXpMdoBGN0xfnq6DmolGIpyxHA_BsFX87NJnNMxvrhf3Scv65lEwgEfNzoFIKumXoz-sSL0o76tlyDUPXqLcyu5EJsGJmx7aXCg-2P7FBJScMFpbvkCPkyVxhrLkduPMenls3XwkKdC9QS0cFe8iedDAinR9b8Jxuk7uUFL8imBqssKPQGT1RRM7bY7OuEi_VZM-9JqhAfGGBChwszE_KmJBweY8SmcJp9Vp2b4IPZtrEbcWPykSefmT2MP2-lUdt874aUPQYVxclc1xmWCqpATR6grkkhoh0SKX1UXWnEUHnHqoQnAAXwgba3UQYX24Xn7sw9b4MdW1LIGDHgvfOJdq2l9-ku0dv6-WXG3x9jMuG3sYiuAdjwgW2s0mSgiI7DBz4jt2WjQyh9KNdWoCx6-ZIWasi_ZtS3qPGP3zPzbEOgC1_lESaF0mne0bLSgbcbE-TnWzzRRbbzBK8"
//   }
//})