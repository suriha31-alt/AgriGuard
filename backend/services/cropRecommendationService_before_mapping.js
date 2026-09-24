const path = require("path");
const { spawn } = require("child_process");

/*
|--------------------------------------------------------------------------
| Python configuration
|--------------------------------------------------------------------------
*/

const PYTHON_PATH = path.join(
    __dirname,
    "..",
    "..",
    ".venv",
    "Scripts",
    "python.exe"
);

const PYTHON_SCRIPT = path.join(
    __dirname,
    "..",
    "ml",
    "recommend.py"
);


/*
|--------------------------------------------------------------------------
| Run Python Recommendation Model
|--------------------------------------------------------------------------
*/

function runPythonRecommendation(input) {

    return new Promise((resolve, reject) => {

        const python = spawn(
            PYTHON_PATH,
            [PYTHON_SCRIPT]
        );

        let output = "";
        let errorOutput = "";


        /*
        |--------------------------------------------------------------------------
        | Send JSON input to Python
        |--------------------------------------------------------------------------
        */

        python.stdin.write(
            JSON.stringify(input)
        );

        python.stdin.end();


        /*
        |--------------------------------------------------------------------------
        | Receive Python output
        |--------------------------------------------------------------------------
        */

        python.stdout.on(
            "data",
            data => {
                output += data.toString();
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Receive Python errors
        |--------------------------------------------------------------------------
        */

        python.stderr.on(
            "data",
            data => {
                errorOutput += data.toString();
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Python process completed
        |--------------------------------------------------------------------------
        */

        python.on(
            "close",
            code => {

                if (code !== 0) {

                    return reject(
                        new Error(
                            errorOutput ||
                            `Python process exited with code ${code}`
                        )
                    );
                }


                try {

                    const result =
                        JSON.parse(output);

                    resolve(result);

                } catch (error) {

                    reject(
                        new Error(
                            `Invalid Python response: ${error.message}\nOutput: ${output}`
                        )
                    );
                }
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Process error
        |--------------------------------------------------------------------------
        */

        python.on(
            "error",
            error => {

                reject(error);

            }
        );

    });

}


/*
|--------------------------------------------------------------------------
| Main Crop Recommendation Service
|--------------------------------------------------------------------------
*/

async function getCropRecommendations(input) {

    try {

        const result =
            await runPythonRecommendation(
                input
            );

        return result;

    } catch (error) {

        console.error(
            "Crop recommendation service error:",
            error
        );

        throw error;
    }

}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
    getCropRecommendations
};