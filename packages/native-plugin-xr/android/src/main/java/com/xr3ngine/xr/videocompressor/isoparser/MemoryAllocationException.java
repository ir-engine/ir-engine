/*
 * Copyright 2008 CoreMedia AG, Hamburg
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.xrengine.xr.videocompressor.isoparser;

public class MemoryAllocationException extends RuntimeException {

    public MemoryAllocationException(String msg) {
        super(msg);
    }

    public MemoryAllocationException(long tried, long limit) {
        super("Tried to allocate "+tried +" bytes, but the limit for this record type is: "+limit+
                ". If you believe this file is not corrupt, please open a ticket on github to increase " +
                "the maximum allowable size for this record type.");
    }
}
