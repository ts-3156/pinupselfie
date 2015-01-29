class TweetsController < ApplicationController
  include TweetsHelper

  before_action :set_tweet, only: [:show]

  def index
    @tweets = Tweet.all
  end

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

  private

  def client
    @client ||= ExTwitter.new(YAML.load_file(Rails.root.join('config/twitter.yml')))
  end

  def set_tweet
    if params[:id].present? && params[:id].match(/\A\d+\z/)
      @tweet = client.status(params[:id])
    end
  end
end
