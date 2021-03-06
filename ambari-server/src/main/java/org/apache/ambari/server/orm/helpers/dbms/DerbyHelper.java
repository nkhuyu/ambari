/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.ambari.server.orm.helpers.dbms;

import org.apache.ambari.server.orm.DBAccessor;
import org.eclipse.persistence.platform.database.DatabasePlatform;

public class DerbyHelper extends GenericDbmsHelper {
  public DerbyHelper(DatabasePlatform databasePlatform) {
    super(databasePlatform);
  }

  @Override
  public boolean supportsColumnTypeChange() {
    return false; //type change is dramatically limited to varchar length increase only, almost useless
  }

  @Override
  public String getRenameColumnStatement(String tableName, String oldName, DBAccessor.DBColumnInfo columnInfo) {
    StringBuilder builder = new StringBuilder();

    builder.append("RENAME COLUMN ").append(tableName).append(".").append(oldName);
    builder.append(" TO ").append(columnInfo.getName());

    return builder.toString();
  }

  @Override
  public StringBuilder writeColumnModifyString(StringBuilder builder, DBAccessor.DBColumnInfo columnInfo) {
    builder.append(" ALTER COLUMN ").append(columnInfo.getName())
      .append(" SET DATA TYPE ");
    writeColumnType(builder, columnInfo);

    return builder;
  }
}
