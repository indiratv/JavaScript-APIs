# Ignore SQLITE warnings related to Decimal numbers in the Chinook database
import warnings
warnings.filterwarnings('ignore')
# Import Dependencies
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import func
from sqlalchemy import inspect
from flask import(
    Flask,
    render_template,
    jsonify,
    request)
import pandas as pd
import json
import numpy as np
##################################################
# Flask Setup
##################################################
app = Flask(__name__)
# Create an engine for the belly_button_biodiversity.sqlite database
engine = create_engine("sqlite:///belly_button_biodiversity.sqlite", echo=False)

# Reflect Database into ORM classes
Base = automap_base()
Base.prepare(engine, reflect=True)
Base.classes.keys()

#Get References for each table
Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata = Base.classes.samples_metadata

# Create session object
session = Session(engine)

@app.route("/")
def index():
# """Return the dashboard homepage."""
    return render_template('index.html')

@app.route('/names')
def names():
    # List of sample names.
    # Returns a list of sample names in the format
    inspector = inspect(engine)
    samplesall = inspector.get_columns('samples')
    samplesall_df = pd.DataFrame(samplesall)
    # samplenames = samplesall_df.loc[samplesall_df["name"] != 'otu_id',]
    samplenamesdf = pd.DataFrame(samplesall_df['name'])
    samplenamesdf.set_index('name',inplace=True)

    return jsonify(list(samplesall_df['name'][1:]))

@app.route('/otu')
def otu():
# """List of OTU descriptions.
# Returns a list of OTU descriptions in the following format
    results = session.query(Otu.lowest_taxonomic_unit_found).all()
 
    return jsonify(list(np.ravel(results)))

@app.route('/metadata/<sample>')
# """MetaData for a given sample.
# Args: Sample in the format: `BB_940`
# Returns a json dictionary of sample metadata in the format
def metadata(sample):
    sampleip = sample[3:]
    metadata = session.query(Samples_metadata).filter(Samples_metadata.SAMPLEID == sampleip).first()
    # print(metadata.AGE)
    metadata_dict={"AGE":metadata.AGE,
                "GENDER": metadata.GENDER,
                "ETHNICITY": metadata.ETHNICITY,
                "BBTYPE": metadata.BBTYPE,
                "LOCATION": metadata.LOCATION,
                "SAMPLEID": metadata.SAMPLEID}

    return jsonify(metadata_dict)

@app.route('/wfreq/<sample>')
# """Weekly Washing Frequency as a number.
# Args: Sample in the format: `BB_940`
# Returns an integer value for the weekly washing frequency `WFREQ`
def wfreq(sample):
    sampleip = sample[3:]
    metadata = session.query(Samples_metadata).filter(Samples_metadata.SAMPLEID == sampleip).first()

    return jsonify(metadata.WFREQ)

@app.route('/samples/<sample>')
# """OTU IDs and Sample Values for a given sample.
# Sort your Pandas DataFrame (OTU ID and Sample Value)in Descending Order by Sample Value
# Return a list of dictionaries containing sorted lists  for `otu_ids` and `sample_values`
def samples(sample):
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt, session.bind)
    df = df[df[sample] > 1]
    df = df.sort_values(by=sample, ascending=0)
    # Format the data to send as json
    data = [{
            "otu_ids": df[sample].index.values.tolist(),
            "sample_values": df[sample].values.tolist()
        }]
    return jsonify(data)



##################################################
# Initiate Flask app
##################################################
if __name__=="__main__":
    app.run(debug=True)