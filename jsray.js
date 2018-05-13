// Auxiliary constants
const INFTY   = 999999999;
const EPSILON = 0.0000001;

// Color class represents a normalized color.
// Each value for Red, Green and Blue should be
// in the range [0, 1].
class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    add(color) {
        var newColor = new Color(0, 0, 0);
        newColor.r = Math.min(1, this.r + color.r);
        newColor.g = Math.min(1, this.g + color.g);
        newColor.b = Math.min(1, this.b + color.b);
        return newColor;
    }

    multiply(color) {
        var newColor = new Color(0, 0, 0);
        newColor.r = Math.min(1, this.r * color.r);
        newColor.g = Math.min(1, this.g * color.g);
        newColor.b = Math.min(1, this.b * color.b);
        return newColor;
    }

    multiplyScalar(scalar) {
        var newColor = new Color(this.r * scalar, this.g * scalar, this.b * scalar);
        return newColor;
    }

    toHex() {
        var r = parseInt(this.r * 255);
        var g = parseInt(this.g * 255);
        var b = parseInt(this.b * 255);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}

// Represents a vector and provides handy vector operations
class Vector3d {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vector) {
        var newVector = new Vector3d(0, 0, 0);
        newVector.x = this.x + vector.x;
        newVector.y = this.y + vector.y;
        newVector.z = this.z + vector.z;
        return newVector;
    }

    substract(vector) {
        var newVector = new Vector3d(0, 0, 0);
        newVector.x = this.x - vector.x;
        newVector.y = this.y - vector.y;
        newVector.z = this.z - vector.z;
        return newVector;   
    }

    multiply(vector) {
        var newVector = new Vector3d(0, 0, 0);
        newVector.x = this.x * vector.x;
        newVector.y = this.y * vector.y;
        newVector.z = this.z * vector.z;
        return newVector;   
    }

    addScalar(scalar) {
        var newVector = new Vector3d(0, 0, 0);
        newVector.x = this.x + scalar;
        newVector.y = this.y + scalar;
        newVector.z = this.z + scalar;
        return newVector;   
    }

    substractScalar(scalar) {
        var newVector = new Vector3d(0, 0, 0);
        newVector.x = this.x - scalar;
        newVector.y = this.y - scalar;
        newVector.z = this.z - scalar;
        return newVector;   
    }

    multiplyScalar(scalar) {
        var newVector = new Vector3d(0, 0, 0);
        newVector.x = this.x * scalar;
        newVector.y = this.y * scalar;
        newVector.z = this.z * scalar;
        return newVector;   
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var f = Math.sqrt((x * x) + (y * y) + (z * z));

        this.x = x / f;
        this.y = y / f;
        this.z = z / f;
    }

    dot(vector) {
        return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
    }

    distanceTo(vector) {
        return Math.sqrt(Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2) + Math.pow(this.z - vector.z, 2));
    }
}

// Encondes a pixel
class Pixel {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

// Represents a radial light
class Light {
    constructor() {
        this.position = new Vector3d(0, 0, 0);
        this.color = new Color(0, 0, 0);
        this.difuse = 0;
        this.ambient = 0;
        this.specular_c = 0;
        this.specular_k = 0;
    }
}

class TraceResult {
    constructor() {
        this.succeded = false;
        this.object_index = 0;
        this.M = new Vector3d(0, 0, 0);
        this.N = new Vector3d(0, 0, 0);
        this.color = new Color(0, 0, 0);
    }
}

class Plane {
    constructor(position, normal, color, reflection) {
        this.position = position;
        this.normal = normal;
        this.color = color;
        this.reflection = reflection;
    }

    intersect(rayO, rayD) {
        var denom = rayD.dot(this.normal);
        if (Math.abs(denom) < EPSILON)
            return INFTY;

        var d = (this.position.substract(rayO)).dot(this.normal) / denom;
        if (d < 0 || INFTY < d)
            return INFTY;

        return d;
    } 

    getNormal(vector) {
        //return this.normal;
        function angleBetweenVectors(u, v) {
            return Math.acos(u.dot(v) / (u.magnitude() * v.magnitude()));
        };

        function Rx(v, theta) {
            var x = v.x;
            var y = v.y * Math.cos(theta) - v.z * Math.sin(theta);
            var z = v.y * Math.cos(theta) + v.z * Math.sin(theta);
            return (new Vector3d(x, y, z));
        };

        function Ry(v, theta) {
            var x =  v.x * Math.cos(theta) + v.z * Math.sin(theta);
            var y =  v.y;
            var z = -v.x * Math.sin(theta) + v.z * Math.cos(theta);
            return (new Vector3d(x, y, z));
        };

        function Rz(v, theta) {
            var x = v.x * Math.cos(theta) - v.y * Math.sin(theta);
            var y = v.x * Math.sin(theta) + v.y * Math.cos(theta);
            var z = v.z;
            return (new Vector3d(x, y, z));
        };

        var a =  angleBetweenVectors(vector, new Vector3d(0, vector.y, vector.z));
        var b =  angleBetweenVectors(vector, new Vector3d(vector.x, 0, vector.z));
        var g = -0.5 * angleBetweenVectors(vector, new Vector3d(vector.x, vector.y, 0));

        var reflection = Rx(Ry(Rz(this.normal, a), b), g);
        return reflection;
    }
}

class Sphere {
    constructor(center, radius, color, reflection) {
        this.center = center;
        this.radius = radius;
        this.color = color;
        this.reflection = reflection;
    }

    intersect(rayO, rayD) {
        var OS = rayO.substract(this.center);
        var r = this.radius;
        var a = rayD.dot(rayD);
        var b = 2 * rayD.dot(OS);
        var c = OS.dot(OS) - r * r;
        var d = INFTY;

        var disc = b * b - 4 * a * c;
        if (disc > 0)
        {
            var discSqrt = Math.sqrt(disc);
            var q;
            if (b < 0)
                q = (-b - discSqrt) / 2;
            else
                q = (-b + discSqrt) / 2;
            var t0 = q / a;
            var t1 = c / q;
            t0 = Math.min(t0, t1);
            t1 = Math.max(t0, t1);
            if (t1 >= 0)
            {
                if (t0 < 0)
                    d = t1;
                else
                    d = t0;
            }
        }

        if (d < 0 || INFTY < d)
            return INFTY;

        return d;
    }

    getNormal(vector) {
        var normalVector = vector.substract(this.center);
        normalVector.normalize()
        return normalVector;
    }
}

class Camera {
    constructor(context, width, height, position) {
        this.context = context;
        this.screenWidth = width;
        this.screenHeight = height;
        
        var screenRatio = width / height;
        this.screenRect = [-1, -1 / screenRatio + 0.25, 1, 1 / screenRatio + 0.25];
        
        this.position = position;
        this.rayTarget = new Vector3d(0, 0, 0);

        this.screenPixels = [];
        this.initializeScreenPixels();
    }

    initializeScreenPixels() {
        for (var y = 0; y < this.screenHeight; y++) {
            for (var x = 0; x < this.screenWidth; x++) {
                var color = new Color(0, 0, 0);
                var pixel = new Pixel(x, y, color)
                this.screenPixels.push(pixel);
            }
        }
    }

    // Set camera to "point" a ray in the direction of the vector
    // normal to the provided pair of screen coordinates.
    pointRayFromScreenCoord(x, y)
    {
        var x0 = this.screenRect[0];
        var y0 = this.screenRect[1];
        var x1 = this.screenRect[2];
        var y1 = this.screenRect[3];

        var w = Math.abs(x1 - x0) / this.screenWidth;
        var h = Math.abs(y1 - y0) / this.screenHeight;

        if (x0 < x1) {
            this.rayTarget.x = x0 + x * w;
        }
        else {
            this.rayTarget.x = x0 - x * w;
        }

        if (y0 < y1) {
            this.rayTarget.y = y0 + y * w;
        }
        else {
            this.rayTarget.y = y0 - y * w;
        }
    }

    paintPixel(pixel) {
        var x = pixel.x;
        var y = -pixel.y + this.screenHeight;

        this.context.fillStyle = pixel.color.toHex();
        this.context.fillRect(x, y, 1, 1);
    }

    paintFrame() {
        for (var i = 0; i < this.screenPixels.length; i++) {
            this.paintPixel(this.screenPixels[i]);
        }
    }
}

class Scene {
    constructor(camera, light, maxReflections, sceneObjects) {
        this.camera = camera;
        this.light = light;
        this.maxReflections = maxReflections;
        this.objects = sceneObjects;
    }

    traceRay(rayO, rayD, light) {
        // Initialize ray hit result
        var ray_hit = new TraceResult();

        // Initialize object pointer, object index and distance to object
        var current_object;
        var object_index;
        var d = INFTY;

        // Find distance to the nearest object in the path of the ray
        for (var i = 0; i < this.objects.length; i++)
        {
            current_object = this.objects[i];
            var current_distance = current_object.intersect(rayO, rayD);
            if (current_distance < d)
            {
                d = current_distance;
                object_index = i;
            }
        }

        // Return early if the ray did not hit any object
        if (d == INFTY)
            return ray_hit;

        // Select the nearest object
        current_object = this.objects[object_index];

        // Find the point of intersection on the object
        var M = rayO.add(rayD.multiplyScalar(d));

        // Get object normal
        var N = current_object.getNormal(M);

        // Get ray to light
        var ray_to_L = light.position.substract(M);
        ray_to_L.normalize();

        // Get ray to object
        var ray_to_O = rayO.substract(M);
        ray_to_O.normalize();

        // Return early if the point on the object is shadowed
        for (var i = 0; i < this.objects.length; i++)
        {
            if (i != object_index)
            {
                var d = M.distanceTo(this.light.position);
                var ray_from_O = M.add(N.multiplyScalar(1 / Math.pow(d, 2)));
                var in_shadow = this.objects[i].intersect(ray_from_O, ray_to_L) < INFTY;
                if (in_shadow === true)
                    return ray_hit;
            }
        }

        // Get the normalized addition of both vectors
        var ray_add = ray_to_L.add(ray_to_O);
        ray_add.normalize();

        // Set the ray initial color
        ray_hit.color = new Color(light.ambient, light.ambient, light.ambient);

        // Compute Lambert shading
        ray_hit.color = ray_hit.color.add(current_object.color.multiplyScalar(light.diffuse * Math.max(N.dot(ray_to_L), 0.0)));

        // Compute Blinn-Phong shading (specular)
        ray_hit.color = ray_hit.color.add(light.color.multiplyScalar(light.specular_c * Math.pow(Math.max(N.dot(ray_add), 0.0), light.specular_k)));

        // Format the rest of the output and return
        ray_hit.succeded = true;
        ray_hit.object_index = object_index;
        ray_hit.M = M;
        ray_hit.N = N;

        return ray_hit;
    }

    render() {
        // Return early if the  camera screen has no pixels to render.
        // This can happen if the specified width or height for the 
        // render resolution equals zero.
        if (this.camera.screenPixels.length == 0)
        {
            return;
        }

        // Loop through all the pixels in the screen
        for (var i = 0; i < this.camera.screenPixels.length; i++) {
            var current_pixel = this.camera.screenPixels[i];

            this.camera.pointRayFromScreenCoord(current_pixel.x, current_pixel.y);
            var rayO = this.camera.position;
            var rayD = this.camera.rayTarget.substract(this.camera.position);
            rayD.normalize();

            var reflection = 1;
            var reflection_depth = 0;

            // Trace initial rays and compute reflections
            while (reflection_depth < this.maxReflections) {
                // Trace ray
                var ray_hit = this.traceRay(rayO, rayD, this.light);
                
                // Exit loop if the ray did not intersected an object
                if (ray_hit.succeded === false)
                    break;

                // Update pixel color and reflection values
                current_pixel.color = current_pixel.color.add(ray_hit.color.multiplyScalar(reflection));
                reflection = reflection * this.objects[ray_hit.object_index].reflection;
                reflection_depth++;

                // Reflect ray
                var d = ray_hit.M.distanceTo(this.light.position);
                rayO = ray_hit.M.add(ray_hit.N.multiplyScalar(1 / Math.pow(d, 2)));
                rayD = (rayD.substractScalar(d)).multiply(ray_hit.N.multiplyScalar(rayD.dot(ray_hit.N)));
                rayD.normalize();
            }

            // Correct color if needed
            if (current_pixel.color.r > 1) {current_pixel.color.r = 1};
            if (current_pixel.color.g > 1) {current_pixel.color.g = 1};
            if (current_pixel.color.b > 1) {current_pixel.color.b = 1};

            // Store current_pixel back to the camera screen
            this.camera.screenPixels[i] = current_pixel;
        }

        // Paint the frame to the actual screen!
        this.camera.paintFrame();
    }
}

function rgb2Color(r, g, b) {
    r = (r > 255) ? 255 : Math.max(r, 0) / 255;
    g = (g > 255) ? 255 : Math.max(g, 0) / 255;
    b = (b > 255) ? 255 : Math.max(b, 0) / 255;
    var color = new Color(r, g, b);
    return color;
}

function hex2Color(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result)
    {
        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);
        return rgb2Color(r, g, b);
    }

    return (new Color(0, 0, 0));
}

function main() {
    // Define canvas settings
    var canvas = document.getElementById("renderCanvas");    
    const canvasWidth  = canvas.width;
    const canvasHeight = canvas.height;
    var screenContext = canvas.getContext("2d");

    // Create camera
    var camera = new Camera(screenContext, canvasWidth, canvasHeight, new Vector3d(0, 0.35, -1));

    // Create light
    var light = new Light();
    light.position   = new Vector3d(5, 5, -10);
    light.color      = rgb2Color(200, 200, 200);
    light.diffuse    = 1;
    light.ambient    = 0.05;
    light.specular_c = 1;
    light.specular_k = 50;

    // Set maximum number of light reflections to render
    var max_reflections = 3;

    // Create a vector of 3d Objects to be included in the scene
    var scene_objects = [];

    // Add scene plane Plane(position, normal, color, reflection)
    scene_objects.push(new Plane(new Vector3d(0, -0.5, 0), new Vector3d(0, 1, 0), hex2Color("#2c3e50"), 0.2));

    // Add scene spheres Sphere(center, radius, color, reflection)
    scene_objects.push(new Sphere(new Vector3d( 0.75, 0.10, 1.00), .6, rgb2Color(193, 23, 26), 0.25));
    scene_objects.push(new Sphere(new Vector3d(-0.75, 0.10, 2.25), .6, rgb2Color(34, 152, 40), 0.30));
    scene_objects.push(new Sphere(new Vector3d(-2.75, 0.10, 3.50), .6, rgb2Color(45, 45, 192), 0.50));
    
    // Create the scene
    var scene = new Scene(camera, light, max_reflections, scene_objects);

    // Render scene
    scene.render();
}

main();