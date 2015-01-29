class TweetsController < ApplicationController
  include TweetsHelper

  before_action :set_tweet, only: [:show, :edit, :update, :destroy]

  # GET /tweets
  # GET /tweets.json
  def index
    @tweets = Tweet.all
  end

  # GET /tweets/1
  # GET /tweets/1.json
  def show
    @user = @tweet.user
    @photo =
      if params[:photo_id].present? && params[:photo_id].match(/\A\d+\z/) && @tweet.media?
        photo_id = params[:photo_id]
        photo = @tweet.media.find{|m| m.id == photo_id }
        @tweet.media.first if photo.nil?
      else
        Hashie::Mash.new(Hash.new(''))
      end
  end

  # GET /tweets/new
  def new
    @tweet = Tweet.new
  end

  # GET /tweets/1/edit
  def edit
  end

  # POST /tweets
  # POST /tweets.json
  def create
    @tweet = Tweet.new(tweet_params)

    respond_to do |format|
      if @tweet.save
        format.html { redirect_to @tweet, notice: 'Tweet was successfully created.' }
        format.json { render :show, status: :created, location: @tweet }
      else
        format.html { render :new }
        format.json { render json: @tweet.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tweets/1
  # PATCH/PUT /tweets/1.json
  def update
    respond_to do |format|
      if @tweet.update(tweet_params)
        format.html { redirect_to @tweet, notice: 'Tweet was successfully updated.' }
        format.json { render :show, status: :ok, location: @tweet }
      else
        format.html { render :edit }
        format.json { render json: @tweet.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tweets/1
  # DELETE /tweets/1.json
  def destroy
    @tweet.destroy
    respond_to do |format|
      format.html { redirect_to tweets_url, notice: 'Tweet was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_tweet
      @client ||= ExTwitter.new(YAML.load_file(Rails.root.join('config/twitter.yml')))
      if params[:id].present? && params[:id].match(/\A\d+\z/)
        @tweet = @client.status(params[:id])
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def tweet_params
      params[:tweet]
    end
end
